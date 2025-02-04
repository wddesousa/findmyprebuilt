import { NextRequest, NextResponse } from "next/server";
import { nzxtFind, scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults, prebuiltTrackerResults } from "../types";
import prisma from '@/app/db'
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../utils"
import { serializeNumber } from "../serializers";
import { sleep } from "@/app/utils";

export async function GET(req: NextRequest) {
    //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
    const scraperMap: Record<prebuiltBrands, [string, (url: string, brand_id: string) => Promise<prebuiltTrackerResults>, (url: string) => Promise<scraperRawResults>]> = {
        'NZXT': ['https://nzxt.com/category/gaming-pcs/prebuilt-pcs', nzxtFind, scrapeNzxt]
    }

    for (const brandName in scraperMap) {
        const brand = await prisma.brand.findUnique({ where: { name: brandName } });

        if (!brand) throw new Error('Brand not found');

        const [url, find, scrape] = scraperMap[brandName as prebuiltBrands]
        const foundPages = await find(url, brand.id)

        for (const page in foundPages.new) {
            await sleep(3000)
            const newPrebuilt = await scrape(page)
            const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt)
            foundPages.current.push(page)
            const slugString = foundPages.current.join(";")
            await prisma.$transaction([
                prisma.newProductQueue.create({ data: {type: "ADD", website_url: newPrebuilt.url, scraped_data: JSON.stringify(cleanedPrebuilt)} }),
                prisma.productTracker.upsert({ where: { brand_id: brand.id }, update: { current_products_slugs: slugString, last_scraped_at: new Date() }, create: { brand_id: brand.id, current_products_slugs: slugString } })
            ])
        }
    }
}