import { fullProductName } from "@/app/lib/types";
import { cleanedResults } from "@/app/api/scrape/types";
import { productSearchResult } from "@/app/lib/types";
import axios from "axios";

export async function fetchPrebuilt(productName: string) {
  try {
    const response = await axios.get("/api/prebuilts", {
      params: { search: productName }, // Query parameters go here
    });
    return response.data as fullProductName[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export const inputMap: Record<
  Exclude<keyof cleanedResults["processedResults"], "parts">,
  "number" | "text" | "boolean" | "dropdown"
> = {
  os_id: "dropdown",
  base_price: "text",
  psu_wattage: "number",
  rear_fan_mm: "number",
  customizable: "boolean",
  front_fan_mm: "number",
  cpu_air_cooler_height_mm: "number",
  cpu_aio_cooler_size_mm: "number",
  memory_modules: "number",
  main_storage_gb: "number",
  memory_speed_mhz: "number",
  moba_form_factor: "dropdown",
  case_form_factor: "dropdown",
  moba_chipset_id: "dropdown",
  main_storage_form_factor_id: "dropdown",
  secondary_storage_form_factor_id: "dropdown",
  warranty_months: "number",
  memory_module_gb: "number",
  secondary_storage_gb: "number",
  main_storage_type_id: "dropdown",
  psu_efficiency_rating: "dropdown",
  secondary_storage_type_id: "dropdown",
  wireless: "boolean",
};

export const searchValue = async (name: string, value: string) => {
  const params = new URLSearchParams({ keyword: value });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_AUTOCOMPLETE_URL}/${name}?keyword=${params.toString()}`
    );
    return response.data as productSearchResult[];
  } catch (error) {
    console.error("Error:", error);
  }
  return [];
};

export const sendScrapeRequest = async (url: string) => {
  try {
    const response = await axios.post(`/api/scrape/pcparts`, {
      url: url,
    });
    return response.data as productSearchResult[];
  } catch (error) {
    console.error("Error:", error);
  }
  return [];
};
