import { NextRequest, NextResponse } from "next/server";
import { nzxtFind, scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults, prebuiltTrackerResults } from "../types";
import prisma from '@/app/db'
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults, savePrebuiltScrapeResults } from "../utils"
import { serializeNumber } from "../serializers";
import { sleep } from "@/app/utils";

export async function GET(req: NextRequest) {
    //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
    const scraperMap: Record<prebuiltBrands, [string, (url: string, brand_id: string) => Promise<prebuiltTrackerResults>, (url: string) => Promise<scraperRawResults>]> = {
        'NZXT': ['https://nzxt.com/category/gaming-pcs/prebuilt-pcs', nzxtFind, scrapeNzxt]
    }

    for (const brandName in scraperMap) {
        const [url, find, scrape] = scraperMap[brandName as prebuiltBrands]
        const foundPages = await find(url, brandName)

        for (const page in foundPages.new) {
            const newPrebuilt = await scrape(page)
            const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt)
            foundPages.current.push(page)
            await savePrebuiltScrapeResults(foundPages, cleanedPrebuilt, brandName)
            await sleep(3000)
        }
    }
}