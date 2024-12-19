import puppeteer from 'puppeteer-extra'
import { connect } from 'puppeteer-real-browser'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import untypedMap from './serialization-map.json'
import { Cpu, Gpu, PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import {ProductType} from '@prisma/client'
import { UniversalSerializationMap, PartType, PrismaModelMap } from './types'
import { genericSerialize } from './serializers'
import { ElementHandle } from 'puppeteer'
import { AssertionError } from 'assert'

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
    switch (product_type) {
        case 'cpu':
            const serialized = serializeProduct('cpu', specs)
            saveCpu(serialized)
            break;
    
        default:
            break;
    }
    
}

function serializeProduct<T extends keyof PrismaModelMap>(
    productType: T,
    specs: ElementHandle<Element>[]
): PrismaModelMap[T] {
    const serialized: Partial<PrismaModelMap[T]> = {}
    const map = untypedMap as unknown as UniversalSerializationMap
    
    for (const spec of specs) {
        const specName = await spec.$eval('.group__title', (l) =>
            (l as HTMLHeadingElement).innerText.trim()
        )

        const mapped = map[productType][specName]

        if (typeof mapped === 'undefined')
            throw new Error(`No mapping found for spec '${specName}'`)
        
        const [snakeSpecName, mappedSpecSerializationType] = mapped

        //TODO
        const specValue = await spec.evaluate(
            (s) => 'a string' //s.childNodes[1]?.textContent
        )
        //

        if (specValue == null || specValue.trim() === '') {
            // serialized[snakeSpecName] = null
            throw new Error(`Spec '${specName}' cannot be undefined or empty`)
        } else if (mappedSpecSerializationType === 'custom') {
            // serialized[snakeSpecName] =
                // customSerializers[endpoint]![snakeSpecName]!(specValue)
        } else {
            serialized[snakeSpecName] = genericSerialize(
                specValue,
                mappedSpecSerializationType
            )
        }
        for (const spec in map[productType]) {
            if (map[productType][spec][0] in serialized === undefined)
                throw new Error(`No mapping found for spec '${specName}'`)
        }
    }
    return serialized
}

function assertPropertyExists(val: any): asserts val is undefined {
    if (typeof val === undefined) {
      throw new AssertionError("Not a string!");
    }
  }
function saveCpu(specs: Partial<Cpu>) {
    prisma.cpu.create({
        data: {
            product: {
                create: {
                    product_name: 'test',
                    brand: {connectOrCreate: specs. }
                }
            }
        }
    })
}