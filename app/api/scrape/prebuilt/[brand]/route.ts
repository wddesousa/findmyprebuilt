import { NextRequest, NextResponse } from "next/server";
import { nzxtFind } from "../utils/nzxt";
import {
  prebuiltBrands,
  scraperRawResults,
  prebuiltTrackerResults,
  prebuiltScraperFunction,
  cleanedResults,
} from "../../types";
import prisma, { addProductToQueue } from "@/app/db";
import { Prebuilt, PrismaClient, Product } from "@prisma/client";
import { cleanPrebuiltScrapeResults } from "../../utils";
import { serializeNumber } from "../../serializers";
import { sleep } from "@/app/utils";
import { upsertBrand } from "../../db";
import { findProductUpdates, savePrebuiltScrapeResults } from "../utils/utils";
import { getFile } from "@/tests/helpers/utils";
import { addPrebuiltScrapingJob } from "./queue";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  //first in array is the function to check if new prebuilts are available, second scrapes the prebuilt
  try {

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
        (url: string) => Promise<string[]>
      ]
    > = {
      NZXT: [
        "https://nzxt.com/category/gaming-pcs/prebuilt-pcs",
        nzxtFind
      ],
      test: [getFile("nzxt-list-alt.html"), nzxtFind],
    };

    const brandName = (await params).slug.replace("-", " " as prebuiltBrands);

    if (!(brandName in scraperMap)) {
      return NextResponse.json(
        { error: `Brand not configured` },
        { status: 400 }
      );
    }
    const [url, find] = scraperMap[brandName as prebuiltBrands];
    const brand = await upsertBrand(brandName);
    const prebuilts = await find(url);
    const foundPages = await findProductUpdates(brand.id, prebuilts)

    for (const page of foundPages.new) {
      await addPrebuiltScrapingJob(brand, page);
    }

    for (const removedPage of foundPages.removed) {
      await addProductToQueue("REMOVE", removedPage, {} as cleanedResults);
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
