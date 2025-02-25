import { NextRequest, NextResponse } from "next/server";
import { nzxtFind } from "../utils/nzxt";
import { prebuiltBrands, cleanedResults } from "../../types";
import { addProductToQueue } from "@/app/db";
import { getBrandFromSlug } from "../../utils";
import { upsertBrand } from "../../db";
import { findProductUpdates } from "../utils/utils";
import { getFile } from "@/tests/helpers/utils";
import { addPrebuiltScrapingJob } from "./queue";

const scraperMap: Record<
prebuiltBrands,
[string, (url: string) => Promise<string[]>]
> = {
NZXT: ["https://nzxt.com/category/gaming-pcs/prebuilt-pcs", nzxtFind],
test: [getFile("nzxt-list-alt.html"), nzxtFind],
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  
  try {

    const brandName = await getBrandFromSlug(params);

    if (!(brandName in scraperMap)) {
      return NextResponse.json(
        { error: `Brand not configured` },
        { status: 400 }
      );
    }
    const [url, find] = scraperMap[brandName as prebuiltBrands];
    const brand = await upsertBrand(brandName);
    const prebuilts = await find(url);
    const foundPages = await findProductUpdates(brand.id, prebuilts);

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
