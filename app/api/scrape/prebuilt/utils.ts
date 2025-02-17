import prisma from "@/app/db";
import { prebuiltTrackerResults } from "../types";

export async function findProductUpdates(brand_name: string, slug_list: string[]): Promise<prebuiltTrackerResults> {
    const savedProducts = await prisma.productTracker.findFirst({ where: {brand: {name: brand_name}} });
  
    if (!savedProducts) return { new: slug_list, removed: [], current: [] };
  
    const existingProducts = savedProducts.current_products_slugs.split(';')
    const newProducts = slug_list.filter(slug => !existingProducts.includes(slug));
    const removedProducts = existingProducts.filter(slug => !slug_list.includes(slug));
    return { new: newProducts, removed: removedProducts, current: existingProducts };
  }


  export const prebuiltList: prebuiltTrackerResults = {
    current: [],
    new: [],
    removed: [],
  }