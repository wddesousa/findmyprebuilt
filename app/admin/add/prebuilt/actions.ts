"use server";

import { formDataToObject, getGpuChipset, saveNewPrebuilt, uploadImageToCloud } from "./utils/db";
import { cleanedResults, prebuiltParts } from "@/app/api/scrape/types";
import { generateSlug } from "@/app/utils";
import { prebuiltSchema, PrebuiltSchemaType } from "./types";
import {getProductByFullName} from "@/app/db";


export async function submitPrebuilt(
  cleanedResults: cleanedResults,
  prevState: any,
  formData: FormData
) {
  const unvalidatedFields = await formDataToObject(formData, [
    "images",
    "amazon",
  ]);
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
    if (data[key] !== '') {
      try {
        const product = key === 'gpu_chipset' ? await getGpuChipset(data[key]) :  await getProductByFullName(data[key]);
        if (product.length === 0) 
          throw Error()

        //change the data from the form from a part name to the id in the database
        data[key] = product[0].id;
        
      } catch (error) {
        console.error(error);
        return {
          partError: {[key]: `The provided name for the pc part ${part} doesn't exist in the database`}
        }
      }
    }
  }

  for (let index = 0; index < data.images.length; index++) {
    const image = data.images[index];
    try {
      const uploaded = await uploadImageToCloud(image, generateSlug(data.brand, data.name))
      data.images[index] = uploaded.url;
      console.log(uploaded);
    } catch (error) {
      console.error(error);
      return { imageError: `Error uploading images ${error}` };
    }
  }

  try {
    await saveNewPrebuilt(data, cleanedResults)
  } catch(error) {
    console.log(error);
    return {
      saveError: `Error saving prebuilt: ${error}`
    }
  }


  return {
    message: "Success",
  };
}
