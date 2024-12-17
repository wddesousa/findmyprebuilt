import puppeteer from 'puppeteer-extra'
import { connect } from 'puppeteer-real-browser'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import untypedMap from './serialization-map.json'
import { Cpu, PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import {ProductType} from '@prisma/client'
import { UniversalSerializationMap, PartType, PrismaModelMap } from './types'
import { genericSerialize } from './serializers'

const prisma = new PrismaClient()

const launch_config = {
    headless: true,
    defaultViewport: null,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-gpu' ],
 }
export async function ScrapeCpu(url: string) {
    // const { browser, page } = await connect({
    //     headless: false,

    //     args: [],

    //     customConfig: {},

    //     turnstile: true,

    //     connectOption: {},

    //     disableXvfb: false,
    //     ignoreAllFlags: false
    // })
    puppeteer.use(StealthPlugin())
    console.log(`starting`)
    const browser = await puppeteer.launch(launch_config)
    console.log(`launching`)
    const page = await browser.newPage()
    console.log(`going to... ${url}`)
    const res = await page.goto(url)

    try {
        console.log('Awaiting')
        await page.waitForSelector('nav', { timeout: 5000 })
    } catch {
        console.error(
            `Initial fetch test failed (HTTP ${
                res?.status() ?? '?'
            }). Try running with \`{ headless: false }\` to see what the problem is.`
        )
        throw new Error(`Initial fetch test failed (HTTP ${
                res?.status() ?? '?'
            }). Try running with \`{ headless: false }\` to see what the problem is.`)
    }
    const specs = await page.$$('.xs-hide .group--spec')
    const product_type = await page.$eval('.breadcrumb a', (l) => (l as HTMLAnchorElement).innerText.toLowerCase() as keyof UniversalSerializationMap)
    const map = untypedMap as unknown as UniversalSerializationMap
    //TODO: if product_type not in keys of map
    let serialized: Record<string, any> = {}


    for (const spec of specs) {
        const specName = await spec.$eval('.group__title', (l) =>
            (l as HTMLHeadingElement).innerText.trim()
        )

        // await prisma[untypedMap as unknown as keyof UniversalSerializationMap].create({data: {}})

        const mapped = map[product_type][specName]

        if (typeof mapped === 'undefined')
            throw new Error(`No mapping found for spec '${specName}'`)
        
        const [snakeSpecName, mappedSpecSerializationType] = mapped

        //TODO
        const specValue = await spec.evaluate(
            (s) => s.childNodes[1]?.textContent
        )
        //

        if (specValue == null || specValue.trim() === '') {
            serialized[snakeSpecName] = null
        } else if (mappedSpecSerializationType === 'custom') {
            // serialized[snakeSpecName] =
                // customSerializers[endpoint]![snakeSpecName]!(specValue)
        } else {
            serialized[snakeSpecName] = genericSerialize(
                specValue,
                mappedSpecSerializationType
            )
        }
    }           

    switch (product_type) {
        case 'cpu':
            saveCpu(serialized)
            break;
    
        default:
            break;
    }
    
}

function saveCpu(specs: UniversalSerializationMap['cpu']) {

}