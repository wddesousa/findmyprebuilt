import { NextRequest, NextResponse } from "next/server";
import { nzxtFind, scrapeNzxt } from "./nzxt/scraper";
import {
  prebuiltBrands,
  scraperRawResults,
  prebuiltTrackerResults,
} from "../types";
import prisma from "@/app/db";
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import {
  cleanPrebuiltScrapeResults,
} from "../utils";
import { serializeNumber } from "../serializers";
import { sleep } from "@/app/utils";
import { upsertBrand } from "../db";
import { savePrebuiltScrapeResults } from "./utils";

export async function POST(req: NextRequest) {
  //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
  const scraperMap: Record<
    prebuiltBrands,
    [
      string,
      (url: string, brand_id: string) => Promise<prebuiltTrackerResults>,
      (url: string) => Promise<scraperRawResults>,
    ]
  > = {
    NZXT: [
      "https://nzxt.com/category/gaming-pcs/prebuilt-pcs",
      nzxtFind,
      scrapeNzxt,
    ],
  };

  for (const brandName in scraperMap) {
    const [url, find, scrape] = scraperMap[brandName as prebuiltBrands];
    const brandId = (await upsertBrand(brandName)).id
    const foundPages = await find(url, brandId);

    for (const page in foundPages.new) {
      const newPrebuilt = await scrape(page);
      const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);
      foundPages.current.push(page);
      await savePrebuiltScrapeResults(foundPages, cleanedPrebuilt, brandId);
      await sleep(3000);
    }
  }
}
