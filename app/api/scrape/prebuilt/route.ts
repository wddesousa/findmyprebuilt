import { NextResponse } from "next/server";
import { scrapeNzxt } from "./scrapers";
import { prebuiltBrands, scraperRawResults } from "./types/types";
import prisma from '@/app/db'
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanTrademarks, getCoolerType, getMemoryInfo, getPsuInfo, getStorageInfo } from "../utils";
import { serializeNumber } from "../serializers";

type cleanedResults = {
    rawResults: scraperRawResults
    processedResults: {[K in keyof Omit<Prebuilt, "product_id" | "cpu_id">]: Prebuilt[K] | null | undefined}
}


const getNumber = (value: any)  => value ? serializeNumber(value) : null
const findIdByName = async (name: any, model: "psuRating" | "memorySpeed" | "operativeSystem" | "gpuChipset" | "mobaChipset") => name ? (await (prisma[model] as any).findUnique({where: {name: name}}))?.id : null

async function serializePrebuilts(scrapeResults: scraperRawResults): Promise<cleanedResults> {

    const memoryInfo = getMemoryInfo(scrapeResults.prebuiltParts.ram)
    const mainStorageInfo = await getStorageInfo(scrapeResults.prebuiltParts.main_storage)
    const secondaryStorageInfo = await getStorageInfo(scrapeResults.prebuiltParts.second_storage)
    const psuInfo = getPsuInfo(scrapeResults.prebuiltParts.psu)

    return {
        rawResults: scrapeResults,
        processedResults: {
            cpu_cooler_mm: getNumber(scrapeResults.prebuilt.cpu_cooler_mm),
            cpu_cooler_type: scrapeResults.prebuilt.cpu_cooler_type ? getCoolerType(scrapeResults.prebuilt.cpu_cooler_type) : null,
            customizable: scrapeResults.prebuilt.customizable,
            front_fan_mm: getNumber(scrapeResults.prebuilt.front_fan_mm),
            rear_fan_mm: getNumber(scrapeResults.prebuilt.rear_fan_mm),
            os_id: await findIdByName(scrapeResults.prebuilt.os, 'operativeSystem'),
            gpu_chipset_id: await findIdByName(scrapeResults.prebuiltParts.gpu, 'gpuChipset'),
            moba_chipset_id: await findIdByName(scrapeResults.prebuiltParts.moba, 'mobaChipset'),
            main_storage_gb: mainStorageInfo?.size,
            seconday_storage_gb: secondaryStorageInfo?.size,
            main_storage_type_id: mainStorageInfo?.type?.id,
            secondary_storage_type_id: secondaryStorageInfo?.type?.id,
            memory_modules: memoryInfo.modules.number,
            memory_module_gb: memoryInfo.modules.size,
            memory_speed_id: await findIdByName(memoryInfo.speed, 'memorySpeed'),
            warranty_months: getNumber(scrapeResults.prebuilt.warranty_months),
            wireless: scrapeResults.prebuilt.wireless,
            psu_efficiency_rating_id: await findIdByName(psuInfo.rating, 'psuRating'),
            psu_wattage: psuInfo.wattage
        }
    }
}

export async function GET(req: Request) {
    const scraperMap: Record<prebuiltBrands, (url: string) => Promise<scraperRawResults>> = {
        'nzxt': scrapeNzxt
    }
    const scrapeResults = await scraperMap[req.body.brand as prebuiltBrands](req.body.url)
    const results = await serializePrebuilts(scrapeResults)
    NextResponse.json(results)
}