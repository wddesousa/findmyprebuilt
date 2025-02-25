import { addPartcrapingJob } from "./queue";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url

    if (!url)
        return NextResponse.json(
            { error: `Url missing` },
            { status: 400 }
        );

    await addPartcrapingJob(url);
    return NextResponse.json({ message: "success" }, { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
