import prisma from "@/app/db"
import { Product } from "@prisma/client"
import { cleanTrademarks } from "../scrape/utils"
import { NextResponse } from "next/server"


export async function GET(req: Request) {
    await prisma.$queryRaw<Product[]>`
                SELECT * FROM products p
                JOIN brands b ON p.brand_id = b.id
                WHERE CONCAT(b.name, ' ', p.name) = ${cleanTrademarks(req.body.product)}
                LIMIT 1
                `
    NextResponse.json(results)
}