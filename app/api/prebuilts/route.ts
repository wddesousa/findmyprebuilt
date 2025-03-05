import { NextResponse } from "next/server";
import prisma from "@/app/db"; // Adjust to your setup
import { Prisma } from "@prisma/client";
import { fullProductName } from "./types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search") || "";

    const prebuilts = await prisma.$queryRaw<
    fullProductName[]
    >(
      Prisma.sql`
      SELECT p.id, CONCAT(b.name, ' ', p.name) AS full_name
      FROM "Product" p
      JOIN "Brand" b ON p.brand_id = b.id
      WHERE CONCAT(b.name, ' ', p.name) = ${query}
      AND type = 'PREBUILT'
      LIMIT 1
    `
    );

    return NextResponse.json(prebuilts || null);
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch prebuilt" },
      { status: 500 }
    );
  }
}
