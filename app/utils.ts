import { Prebuilt } from "@prisma/client";
import slugify from "slugify";


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export const generateSlug = (brand: string, product_name: string) => {
    return slugify(`${brand} ${product_name}`, {lower: true});
  };
  
// export const prebuiltColumnMapping: Record<keyof Prebuilt, string> = {
//   base_price: "Base Price",
//   memory_modules: "Memory Modules",
//   memory_module_gb: "Memory (GB)",
//   main_storage_gb: "Main Storage (GB)",
//   moba_form_factor_id: "Case/Motherboard Form Factors",
//   secondary_storage_gb: "Secondary Storage (GB)",
//   front_fan_mm: "Front Fan Size (mm)",
//   rear_fan_mm: "Rear Fan Size (mm)",
//   cpu_air_cooler_height_mm: "CPU Cooler Height (mm)",
//   cpu_aio_cooler_size_mm: "CPU Cooler Height (mm)",
//   cpu_cooler_type: "CPU Cooler Type",
//   wireless: "Wireless Connectivity",
//   psu_wattage: "PSU Wattage",
//   psu_efficiency_rating: "PSU Efficiency Rating",
//   customizable: "Customizable",
//   warranty_months: "Warranty (Months)",
//   specs_html: "Specifications (HTML)",
//   main_storage_type: "Main Storage Type",
//   secondary_storage_type: "Secondary Storage Type",
//   cpu_variation: "CPU Variation",
// };

export const formFactorSizes: Record<string, { weight: number; name: string }> = {
  //this object shows the order of form factors from low to high. don't change
  MINIITX:  { weight: 1, name: "Mini ITX" },
  MICROATX: { weight: 2, name: "Micro ATX" },
  ATX:      { weight: 3, name: "ATX" },
  EATX:     { weight: 4, name: "EATX" },
};
export const formFactorSerializer = (formFactor: string) => formFactor.toUpperCase().replace(/[ -]/, "").trim();