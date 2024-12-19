import puppeteer from 'puppeteer-extra'
import { connect } from 'puppeteer-real-browser'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import untypedMap from './serialization-map.json'
import { Cpu, Gpu, PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { UniversalSerializationMap, PrismaModelMap } from './types'
import { genericSerialize } from './serializers'
import { Page } from 'puppeteer'
import { AssertionError } from 'assert'

const prisma = new PrismaClient()

const launch_config = {
    headless: true,
    defaultViewport: null,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-gpu' ],
 }
export async function Scrape(url: string) {
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
    const product_type = await page.$eval('.breadcrumb a', (l) => (l as HTMLAnchorElement).innerText.toLowerCase())
    
    //TODO: if product_type not in keys of map
    switch (product_type) {
        case 'cpu':
            const serialized = await serializeProduct('cpu', page)
            saveCpu(serialized)
            break;

        default:
            break;
    }
    
}

async function serializeProduct<T extends keyof PrismaModelMap>(
    productType: T,
    page: Page
){
    const serialized: Partial<PrismaModelMap[T]> = {}
    const map = untypedMap as unknown as UniversalSerializationMap
    const specs = await page.$$('.xs-hide .group--spec')
    serialized.product_name = await page.$eval('.pageTitle', (l) =>
        (l as HTMLHeadingElement).innerText.trim()
    )

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

    }
    return serialized as PrismaModelMap[T]
}

async function saveCpu(specs: PrismaModelMap['cpu']) {
    const cpu = await prisma.cpu.create({
        data: {
            product: {
                create: {
                    product_name: specs.product_name,
                    brand: {
                        connectOrCreate: { 
                            where: { brand: specs.brand },
                            create: { brand: specs.brand }
                         } 
                    },
                    product_type: 'CPU'
                }
            },
            part_number: specs.part_number,
            series: specs.series,
            microarchitecture: specs.microarchitecture,
            core_family: specs.core_family,
            socket: specs.socket,
            core_count: specs.core_count,
            thread_count: specs.thread_count,
            performance_core_clock: specs.performance_core_clock,
            performance_core_boost_clock: specs.performance_core_boost_clock,
            l2_cache: specs.l2_cache,
            l3_cache: specs.l3_cache,
            tdp: specs.tdp,
            integrated_graphics: specs.integrated_graphics,
            maximum_supported_memory: specs.maximum_supported_memory,
            ecc_support: specs.ecc_support,
            includes_cooler: specs.includes_cooler,
            packaging: specs.packaging,
            lithography: specs.lithography,
            includes_cpu_cooler: specs.includes_cpu_cooler,
            simultaneous_multithreading: specs.simultaneous_multithreading,

        }
    })
    console.log(`New cpu created ${cpu}`)
}