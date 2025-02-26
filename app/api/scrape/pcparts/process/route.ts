import { NextRequest, NextResponse } from "next/server";
import { processPartScrapedData } from "../../utils";

export async function POST(req: NextRequest) {
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

    const { url, scrapedData } = body;
    await processPartScrapedData(url, scrapedData);

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
