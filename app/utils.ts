import slugify from "slugify";


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export const generateSlug = (brand: string, product_name: string) => {
    return slugify(`${brand} ${product_name}`, {lower: true});
  };
  
export const prebuiltColumnMapping = {
  base_price: "Base Price",
  memory_modules: "Memory Modules",
  memory_module_gb: "Memory (GB)",
  main_storage_gb: "Main Storage (GB)",
  case_moba_form_factors: "Case/Motherboard Form Factors",
  seconday_storage_gb: "Secondary Storage (GB)",
  front_fan_mm: "Front Fan Size (mm)",
  rear_fan_mm: "Rear Fan Size (mm)",
  cpu_cooler_mm: "CPU Cooler Size (mm)",
  cpu_cooler_type: "CPU Cooler Type",
  wireless: "Wireless Connectivity",
  psu_wattage: "PSU Wattage",
  psu_efficiency_rating: "PSU Efficiency Rating",
  customizable: "Customizable",
  warranty_months: "Warranty (Months)",
  specs_html: "Specifications (HTML)",
  main_storage_type: "Main Storage Type",
  secondary_storage_type: "Secondary Storage Type",
  cpu_variation: "CPU Variation",
};