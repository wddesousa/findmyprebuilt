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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
  try {
    const cronSecret = process.env.PREBUILT_CRON_SECRET;
    const providedSecret = req.headers.get("prebuilt-cron-secret"); // or req.query.secret

    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: `Unauthorized` }, { status: 403 });
    }
    const body = await req.json();
    const url = body.url;
    // const requiredKeys = ['url']; // Replace with your required keys
    // const missingKeys = requiredKeys.filter((key) => !(key in body));
    if (!url) {
      return NextResponse.json(
        { error: `URL missing from request` },
        { status: 400 }
      );
    }

    const scraperMap: Record<
      prebuiltBrands,
      [
        (url: string, brand_id: string) => Promise<prebuiltTrackerResults>,
        (url: string) => Promise<scraperRawResults>,
      ]
    > = {
      NZXT: [nzxtFind, scrapeNzxt],
    };

    const brand = (await params).slug.replace("-", " " as prebuiltBrands);

    if (!(brand in scraperMap)) {
      return NextResponse.json(
        { error: `Brand not configured` },
        { status: 400 }
      );
    }
    const [find, scrape] = scraperMap[brand as prebuiltBrands];
    const brandId = (await upsertBrand(brand)).id;
    const foundPages = await find(url, brandId);
    const savedPrebuilts = [];

    for (const page of foundPages.new) {
      const newPrebuilt = await scrape(page);
      const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);
      foundPages.current.push(page);
      savedPrebuilts.push(
        await savePrebuiltScrapeResults(foundPages, cleanedPrebuilt, brandId)
      );
      if (page != foundPages.new[0]) await sleep(3000);
    }
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
