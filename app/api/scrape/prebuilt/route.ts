import { NextResponse } from "next/server";
import { scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults } from "./types/types";
import prisma from '@/app/db'
import { Prebuilt, Prisma, Product } from "@prisma/client";
import { cleanTrademarks } from "../utils";

type cleanedResults = {
    rawResults: scraperRawResults
    prebuiltAttributes: {[K in keyof Prebuilt]: Prebuilt[K] | null | undefined}
    partsFound: {[K in keyof scraperRawResults["prebuiltParts"] as `${K}_id`]: string | undefined | null}
}

async function getPrebuiltPartsFromDb(scrapeResults: scraperRawResults): Promise<cleanedResults> {
    const parts = scrapeResults.prebuiltParts
    const partsFound: cleanedResults["partsFound"] = {
        moba_id: undefined,
        cpu_id: undefined,
        gpu_id: undefined,
        ram_id: undefined,
        main_storage_id: undefined,
        second_storage_id: undefined,
        psu_id: undefined,
        case_id: undefined,
        front_fan_id: undefined,
        rear_fan_id: undefined,
        cpu_cooler_id: undefined
    }

    for (const spec of Object.keys(parts)) {
        const part = parts[spec as keyof scraperRawResults["prebuiltParts"]]
        if (part) {
            const result = (await prisma.$queryRaw<Product[]>`
                SELECT * FROM products p
                JOIN brands b ON p.brand_id = b.id
                WHERE CONCAT(b.name, ' ', p.name) = ${cleanTrademarks(part)}
                LIMIT 1
                `)

            if (["gpu", "moba"].includes(spec)) {
                //TODO: save chipsets
            }
            partsFound[`${part}_id` as keyof cleanedResults["partsFound"]] = result[0]?.id
        }
    }
    return {
        rawResults: scrapeResults,
        prebuiltAttributes: {
            
        },
        partsFound: partsFound
    }
}

export async function GET(req: Request) {
    const scraperMap: Record<prebuiltBrands, (url: string) => Promise<scraperRawResults>> = {
        'nzxt': scrapeNzxt
    }
    const scrapeResults = await scraperMap[req.body.brand as prebuiltBrands](req.body.url)
    const results = await getPrebuiltPartsFromDb(scrapeResults)
    NextResponse.json(results)
}