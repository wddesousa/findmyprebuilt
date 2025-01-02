import { scrapeAmdMobaChipsets, scrapeIntelMobaChipsets } from "./utils"
import { NextResponse } from "next/server"

export async function GET() {
    console.log('got request')
    // await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
    // await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am5.html')
    const intel = await scrapeIntelMobaChipsets('https://www.intel.com/content/www/us/en/products/details/chipsets/desktop-chipsets/products.html')
    console.log(intel)

    return NextResponse.json(intel)
}
