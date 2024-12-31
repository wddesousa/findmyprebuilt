import { scrapeAmdMobaChipsets } from "../utils"
import { NextResponse } from "next/server"

export async function GET() {
    console.log('got request')
    const test = await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
    console.log(test)
    return NextResponse.json(test)
}
