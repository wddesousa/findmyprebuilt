"use server";

import { z } from "zod";
import { formDataToObject, getPsuEfficiencyRatings } from "./utils/db";
import { CpuCoolerType, PsuRating } from "@prisma/client";
import { cleanedResults } from "@/app/api/scrape/types";

const schema = z.object({
  name: z.string().min(5).nonempty(),
  url: z.string().nonempty(),
  os_id: z.string().nonempty(),
  base_price: z.coerce.number().min(300).max(20000),
  psu_wattage: z.coerce.number().min(400).max(1400),
  rear_fan_mm: z.coerce.number().min(92).max(140),
  customizable: z.coerce.boolean(),
  front_fan_mm: z.coerce.number().min(92).max(140),
  cpu_cooler_mm: z.coerce.number().min(92).max(140),
  gpu_chipset_id: z.string().nonempty(),
  memory_modules: z.coerce.number().min(1).max(4),
  cpu_cooler_type: z.nativeEnum(CpuCoolerType),
  main_storage_gb: z.coerce.number(),
  memory_speed_id: z.string().nonempty(),
  moba_chipset_id: z.string().nonempty(),
  warranty_months: z.coerce.number(),
  memory_module_gb: z.coerce.number(),
  secondary_storage_gb: z.string(),
  main_storage_type_id: z.string().nonempty(),
  psu_efficiency_rating: z.nativeEnum(PsuRating),
  // moba_form_factor: z.
  // case_form_factor: z.
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
  images: z.array(z.string().nonempty()).min(1),
});

export async function submitPrebuilt(
  cleanedResults: cleanedResults,
  prevState: any,
  formData: FormData
) {
  const data = await formDataToObject(formData, ["images", "amazon"]);
  const validatedFields = schema.safeParse(data);
  console.log(formData);
  console.log(data);

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  return {
    message: "Success",
  };
}
