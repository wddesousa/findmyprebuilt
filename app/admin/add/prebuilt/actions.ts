"use server";

import { z } from "zod";
import { formDataToObject, uploadImageToCloud } from "./utils/db";
import { CpuCoolerType, PsuRating } from "@prisma/client";
import { cleanedResults } from "@/app/api/scrape/types";

import { generateSlug } from "@/app/utils";
import { L } from "vitest/dist/chunks/reporters.nr4dxCkA.js";

const schema = z.object({
  brand: z.string().min(1),
  name: z.string().min(5),
  url: z.string().min(1),
  os_id: z.string().min(1),
  base_price: z.coerce.number().min(300).max(20000),
  psu_wattage: z.coerce.number().min(400).max(1400),
  rear_fan_mm: z.coerce.number().min(92).max(140),
  customizable: z.coerce.boolean(),
  front_fan_mm: z.coerce.number().min(92).max(140),
  cpu_cooler_mm: z.coerce.number().min(92).max(140),
  gpu_chipset_id: z.string().min(1),
  memory_modules: z.coerce.number().min(1).max(4),
  cpu_cooler_type: z.nativeEnum(CpuCoolerType),
  main_storage_gb: z.coerce.number().max(24000).min(8),
  memory_speed_id: z.string().min(1),
  moba_chipset_id: z.string().min(1),
  warranty_months: z.coerce.number().min(0).max(60),
  memory_module_gb: z.coerce.number().max(16).min(4),
  secondary_storage_gb: z.coerce.number().max(24000).min(8),
  main_storage_type_id: z.string().min(1),
  psu_efficiency_rating: z.nativeEnum(PsuRating),
  moba_form_factor_id: z.string().min(1),
  case_form_factor: z.string().min(1),
  cpu: z.string(),
  gpu: z.string(),
  psu: z.string(),
  ram: z.string(),
  case: z.string(),
  moba: z.string(),
  rear_fan: z.string(),
  front_fan: z.string(),
  cpu_cooler: z.string(),
  main_storage: z.string(),
  second_storage: z.string(),
  amazon: z.array(z.string()).min(1),
  images: z.array(z.string().min(1)).min(1),
});

export async function submitPrebuilt(
  cleanedResults: cleanedResults,
  prevState: any,
  formData: FormData
) {
  const unvalidatedFields = await formDataToObject(formData, [
    "images",
    "amazon",
  ]);
  const validatedFields = schema.safeParse(unvalidatedFields);
  console.log(formData);
  console.log(unvalidatedFields);

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

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

  return {
    message: "Success",
  };
}
