import { NextResponse } from "next/server";
import { scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults } from "../types";
import prisma from '@/app/db'
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../utils"
import { serializeNumber } from "../serializers";

export async function GET(req: Request) {
    const scraperMap: Record<prebuiltBrands, (url: string) => Promise<scraperRawResults>> = {
        'nzxt': scrapeNzxt
    }
    const scrapeResults = await scraperMap[req.body.brand as prebuiltBrands](req.body.url)
    const results = await cleanPrebuiltScrapeResults(scrapeResults)
    NextResponse.json(results)
}