import prisma from "@/app/db";
import { cleanedResults, prebuiltTrackerResults } from "../types";

export async function findProductUpdates(brandId: string, slug_list: string[]): Promise<prebuiltTrackerResults> {
    const savedProducts = await prisma.productTracker.findFirst({ where: {brand_id: brandId} });
  
    if (!savedProducts) return { new: slug_list, removed: [], current: [] };
  
    const existingProducts = savedProducts.current_products_slugs
    const newProducts = slug_list.filter(slug => !existingProducts.includes(slug));
    const removedProducts = existingProducts.filter(slug => !slug_list.includes(slug));
    return { new: newProducts, removed: removedProducts, current: existingProducts };
  }


export async function savePrebuiltScrapeResults(
  newPage: string,
  cleanedPrebuilt: cleanedResults,
  brandId: string
) {

  const foundPages = await prisma.productTracker.findFirst({where: {brand_id: brandId}});
  const slugs = foundPages ? foundPages.current_products_slugs : [];

  slugs.push(newPage)
  return await prisma.$transaction([
    prisma.newProductQueue.create({
      data: {
        type: "ADD",
        website_url: cleanedPrebuilt.rawResults.url,
        scraped_data: JSON.stringify(cleanedPrebuilt),
      },
    }),
    prisma.productTracker.upsert({
      where: { brand_id: brandId  },
      update: {
        current_products_slugs: slugs,
        last_scraped_at: new Date(),
      },
      create: {
        brand_id: brandId,
        current_products_slugs: slugs,
      },
    }),
  ]);
}


  export const prebuiltList: prebuiltTrackerResults = {
    current: [],
    new: [],
    removed: [],
  }