"use server";

import {
  formDataToObject,
  saveNewPrebuilt,
  uploadImageToCloud,
} from "./utils/server";
import prisma, { getAllGpuChipsets, getAllPrebuiltScores } from "@/app/db";
import { cleanedResults, prebuiltParts } from "@/app/api/scrape/types";
import { generateSlug } from "@/app/lib/utils";
import { prebuiltSchema, PrebuiltSchemaType } from "./types";
import { getProductByFullName } from "@/app/db";
import { updateAllPrebuiltScores } from "@/app/lib/scoring/utils";

export async function submitPrebuilt(
  cleanedResults: cleanedResults,
  prevState: any,
  formData: FormData
) {
  const unvalidatedFields = await formDataToObject(formData, ["images"]);
  const validatedFields = prebuiltSchema.safeParse(unvalidatedFields);
  console.log(formData);
  console.log(unvalidatedFields);

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  for (const part of Object.keys(cleanedResults.processedResults.parts)) {
    //validate that the parts provided exist in the database
    const key = part as keyof prebuiltParts;
    if (data[key] !== "") {
      try {
        const product =
          key === "gpu_chipset"
            ? await getAllGpuChipsets(data[key])
            : await getProductByFullName(data[key]);
        if (product.length === 0) throw Error();

        //change the data from the form from a part name to the id in the database
        data[key] = product[0].id;
      } catch (error) {
        console.error(error);
        return {
          partError: {
            [key]: `The provided name for the pc part ${part} doesn't exist in the database`,
          },
        };
      }
    }
  }

  for (let index = 0; index < data.images.length; index++) {
    const image = data.images[index];
    try {
      const imgUrl = await uploadImageToCloud(
        image,
        generateSlug(data.brand, data.name)
      );
      data.images[index] = imgUrl;
      console.log(imgUrl);
    } catch (error) {
      console.error(error);
      return { imageError: `Error uploading images ${error}` };
    }
  }

  try {
    await saveNewPrebuilt(data, cleanedResults);
    await updateAllPrebuiltScores();
    console.log(JSON.stringify(await prisma.prebuilt.findMany({})))
  } catch (error) {
    console.error(error);
    return {
      saveError: `Error during prebuilt save: ${error}`,
    };
  }

  return {
    message: "Success",
  };
}
