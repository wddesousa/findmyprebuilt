import { cleanPrebuiltScrapeResults, getBrandFromSlug } from "@/app/api/scrape/utils";
import { prebuiltBrands, prebuiltScraperFunction } from "../../../types";
import { processNzxtData } from "../../utils/nzxt";
import { NextRequest, NextResponse } from "next/server";
import { savePrebuiltScrapeResults } from "../../utils/utils";

const scraperMap: Record<prebuiltBrands, prebuiltScraperFunction> = {
  NZXT: processNzxtData,
  test: processNzxtData,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await req.json();
    const requiredKeys = ["url", "scrapedData"]; // Replace with your required keys
    const missingKeys = requiredKeys.filter((key) => !(key in body));

    if (missingKeys.length > 0) {
      return NextResponse.json(
        {
          error: `The following keys are missing from request: ${missingKeys.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const brandName = await getBrandFromSlug(params)

    if (!(brandName in scraperMap)) {
      return NextResponse.json(
        { error: `Brand not configured` },
        { status: 400 }
      );
    }

    const { url, scrapedData } = body;
    const newPrebuilt = scraperMap[brandName](scrapedData, url);
    const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);

    await savePrebuiltScrapeResults(url, cleanedPrebuilt, brandName);

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
