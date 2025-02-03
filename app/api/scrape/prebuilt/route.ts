import { NextRequest, NextResponse } from "next/server";
import { nzxtFindNew, scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults } from "../types";
import prisma from '@/app/db'
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../utils"
import { serializeNumber } from "../serializers";

export async function GET(req: NextRequest) {
    //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
    const scraperMap: Record<prebuiltBrands, [string, (url: string) => boolean, (url: string) => Promise<scraperRawResults>]> = {
        'nzxt': ['https://nzxt.com/category/gaming-pcs/prebuilt-pcs', nzxtFindNew, scrapeNzxt]
    }
}