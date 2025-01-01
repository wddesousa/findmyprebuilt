import { scrapeAmdMobaChipsets, scrapeIntelMobaChipsets } from "../utils"
import { NextResponse } from "next/server"

export async function GET() {
    console.log('got request')
    const amd = await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
    console.log(amd)
    const intel = await scrapeIntelMobaChipsets('https://www.intel.com/content/www/us/en/products/details/chipsets/desktop-chipsets/products.html')
    return NextResponse.json(intel)
}
