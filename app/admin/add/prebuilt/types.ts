import { z } from "zod";
import { CpuCoolerType, PsuRating } from "@prisma/client";

export interface foreignValues {
  id: string;
  name: string;
}

export type prebuiltForeignValues = {
  os_id: foreignValues[];
  memory_speed_id: foreignValues[];
  moba_chipset_id: foreignValues[];
  main_storage_type_id: foreignValues[];
  secondary_storage_type_id: foreignValues[];
  psu_efficiency_rating: foreignValues[];
  moba_form_factor: foreignValues[];
  case_form_factor: foreignValues[];
};

export const prebuiltSchema = z.object({
  brand: z.string().min(1),
  name: z.string().min(5),
  url: z.string().min(1),
  os_id: z.string().min(1),
  base_price: z.coerce.number().min(300).max(20000),
  psu_wattage: z.coerce.number().min(400).max(1400),
  rear_fan_mm: z.coerce.number().min(92).max(140),
  customizable: z.coerce.boolean(),
  front_fan_mm: z.coerce.number().min(92).max(140),
  cpu_air_cooler_height_mm: z
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(z.coerce.number().min(14).max(172).optional()),
  cpu_aio_cooler_size_mm: z
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(z.coerce.number().min(240).max(420).optional()),
  gpu_chipset_score: z.coerce.number().min(300).optional(),
  memory_modules: z.coerce.number().min(1).max(4),
  main_storage_gb: z.coerce.number().max(24000).min(8),
  memory_speed_id: z.string().min(1),
  moba_chipset_id: z.string().min(1),
  wireless: z.coerce.boolean(),
  warranty_months: z.coerce.number().min(0).max(60),
  memory_module_gb: z.coerce.number().max(16).min(4),
  secondary_storage_gb: z.coerce.number().max(24000).min(8),
  main_storage_type_id: z.string().min(1),
  secondary_storage_type_id: z.string().min(1),
  psu_efficiency_rating: z.nativeEnum(PsuRating),
  moba_form_factor: z.string().min(3),
  case_form_factor: z.string().min(3),
  cpu: z.string().min(1),
  gpu_chipset: z.string().min(1),
  cpu_score: z.coerce.number().min(1262).optional(),
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
})
.refine(
  (data) => {
    // Check that exactly one of the two fields is filled
    const isAirCoolerFilled = data.cpu_air_cooler_height_mm !== undefined;
    const isAioCoolerFilled = data.cpu_aio_cooler_size_mm !== undefined;
    return isAirCoolerFilled !== isAioCoolerFilled; // XOR logic
  },
  {
    message: "Either air cooler height or aio cooler size must be filled, and not both.",
    path: ["cpu_air_cooler_height_mm"],
  }
);

export type PrebuiltSchemaType = z.infer<typeof prebuiltSchema>;
