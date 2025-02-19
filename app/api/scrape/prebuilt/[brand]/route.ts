import { NextRequest, NextResponse } from "next/server";
import { nzxtFind, scrapeNzxt } from "../nzxt/scraper";
import {
  prebuiltBrands,
  scraperRawResults,
  prebuiltTrackerResults,
} from "../../types";
import prisma from "@/app/db";
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../../utils";
import { serializeNumber } from "../../serializers";
import { sleep } from "@/app/utils";
import { upsertBrand } from "../../db";
import { savePrebuiltScrapeResults } from "../utils";

export async function POST(req: NextRequest, {params}: { params: Promise<{ brand: string }> }) {
  //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
  try {
    const cronSecret = process.env.PREBUILT_CRON_SECRET;
    const providedSecret = req.headers.get('prebuilt-cron-secret'); // or req.query.secret

    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: `Unauthorized` },
        { status: 403 }
      );
    }

    // const body = await req.json();
    // const requiredKeys = ['']; // Replace with your required keys
    // const missingKeys = requiredKeys.filter((key) => !(key in body));

    // if (missingKeys.length > 0) {
    //   // Return a 400 Bad Request response if keys are missing
    //   return NextResponse.json(
    //     { error: `Missing required keys: ${missingKeys.join(", ")}` },
    //     { status: 400 }
    //   );
    // }

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

    const brand = (await params).brand
    if( scraperMap[brand] === undefined ){
      return NextResponse.json(
            { error: `Brand not configured` },
            { status: 400 }
          );
    }
    const [url, find, scrape] = scraperMap[brandName as prebuiltBrands];
    const brandId = (await upsertBrand(brandName)).id;
    const foundPages = await find(url, brandId);

    for (const page in foundPages.new) {
      const newPrebuilt = await scrape(page);
      const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);
      foundPages.current.push(page);
      await savePrebuiltScrapeResults(foundPages, cleanedPrebuilt, brandId);
      await sleep(3000);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
