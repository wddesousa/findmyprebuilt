import { NextRequest, NextResponse } from "next/server";
import { nzxtFind, scrapeNzxt } from "../nzxt/scraper";
import {
  prebuiltBrands,
  scraperRawResults,
  prebuiltTrackerResults,
  prebuiltScraperFunction,
} from "../../types";
import prisma from "@/app/db";
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../../utils";
import { serializeNumber } from "../../serializers";
import { sleep } from "@/app/utils";
import { upsertBrand } from "../../db";
import { findProductUpdates, savePrebuiltScrapeResults } from "../utils";
import { getFile } from "@/tests/helpers/utils";
import { addScrapingJob } from "./queue";

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
    // const body = await req.json();
    // const url = body.url;
    // // const requiredKeys = ['url']; // Replace with your required keys
    // // const missingKeys = requiredKeys.filter((key) => !(key in body));
    // if (!url) {
    //   return NextResponse.json(
    //     { error: `URL missing from request` },
    //     { status: 400 }
    //   );
    // }

    const scraperMap: Record<
      prebuiltBrands,
      [
        string,
        (url: string) => Promise<string[]>,
        prebuiltScraperFunction,
      ]
    > = {
      NZXT: [
        "https://nzxt.com/category/gaming-pcs/prebuilt-pcs",
        nzxtFind,
        scrapeNzxt,
      ],
      test: [getFile("nzxt-list-alt.html"), nzxtFind, scrapeNzxt],
    };

    const brand = (await params).slug.replace("-", " " as prebuiltBrands);

    if (!(brand in scraperMap)) {
      return NextResponse.json(
        { error: `Brand not configured` },
        { status: 400 }
      );
    }
    const [url, find, scrape] = scraperMap[brand as prebuiltBrands];
    const brandId = (await upsertBrand(brand)).id;
    const prebuilts = await find(url);
    const foundPages = await findProductUpdates(brandId, prebuilts)

    for (const page of foundPages.new) {
      await addScrapingJob(brandId, page, scrape);
    }
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
