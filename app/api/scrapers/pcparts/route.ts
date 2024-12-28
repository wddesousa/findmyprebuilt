import { scrapeAndSavePart } from "../utils"
import { NextResponse } from "next/server"

export async function GET() {
    console.log('got request')
    const test = await scrapeAndSavePart('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')
    return NextResponse.json(test)
}
