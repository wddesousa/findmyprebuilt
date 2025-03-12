import { getProductByFullName } from "@/app/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search") || "";

    const prebuilts = await getProductByFullName(query);

    return NextResponse.json(prebuilts || null);
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch prebuilt" },
      { status: 500 }
    );
  }
}
