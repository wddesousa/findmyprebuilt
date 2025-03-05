import { fullProductName } from "@/app/api/prebuilts/types";
import { cleanedResults } from "@/app/api/scrape/types";
import { productSearchResult } from "@/app/types";
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
  keyof cleanedResults["processedResults"],
  "number" | "text" | "boolean" | "dropdown"
> = {
  os_id: "dropdown",
  base_price: "text",
  psu_wattage: "number",
  rear_fan_mm: "number",
  customizable: "boolean",
  front_fan_mm: "number",
  cpu_cooler_mm: "number",
  gpu_chipset_id: "dropdown",
  memory_modules: "number",
  cpu_cooler_type: "dropdown",
  main_storage_gb: "number",
  memory_speed_id: "dropdown",
  moba_chipset_id: "dropdown",
  warranty_months: "number",
  memory_module_gb: "number",
  seconday_storage_gb: "number",
  main_storage_type_id: "dropdown",
  psu_efficiency_rating: "dropdown",
  secondary_storage_type_id: "dropdown",
  wireless: "boolean",
};

export const searchValue = async (target: HTMLInputElement) => {
  const { name, value } = target;
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
