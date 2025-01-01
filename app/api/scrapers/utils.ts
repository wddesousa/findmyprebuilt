import puppeteer from 'puppeteer-extra'
import { connect } from 'puppeteer-real-browser'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import untypedMap from './serialization-map.json'
import { Cpu, Gpu, Prisma, MobaChipset } from '@prisma/client'
import prisma from '@/app/db'
import { UniversalSerializationMap, PrismaModelMap, MobaChipsetSpecs } from './types'
import { genericSerialize, customSerializers, serializeNumber } from './serializers'
import { Page, Browser } from 'puppeteer'

const LAUNCH_CONFIG = {
    headless: true,
    defaultViewport: null,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-gpu'],
}
puppeteer.use(StealthPlugin())

async function getPuppeteerInstance(url: string, waitForSelector: string): Promise<[Browser, Page]> {
    // const { browser, page } = await connect({
    //     headless: false,

    //     args: [],

    //     customConfig: {},

    //     turnstile: true,

    //     connectOption: {},

    //     disableXvfb: false,
    //     ignoreAllFlags: false
    // })
    const browser = await puppeteer.launch(LAUNCH_CONFIG)
    const page = await browser.newPage()
    const res = await page.goto(url)

    try {
        await page.waitForSelector(waitForSelector, { timeout: 5000 })
    } catch {
        console.error(
            `Initial fetch test failed (HTTP ${res?.status() ?? '?'
            }). Try running with \`{ headless: false }\` to see what the problem is.`
        )
        throw new Error(`Initial fetch test failed (HTTP ${res?.status() ?? '?'
            }). Try running with \`{ headless: false }\` to see what the problem is.`)
    }

    return [browser, page]
}

export async function scrapeAndSavePart(url: string) {

    const [browser, page] = await getPuppeteerInstance(url, 'nav')
    const product_type = await page.$eval('.breadcrumb a', (l) => (l as HTMLAnchorElement).innerText.toLowerCase())

    const productTitleMapping: Record<string, keyof PrismaModelMap> = {
        'video card': 'gpu',
        'cpu': 'cpu'
    }

    const productKey = productTitleMapping[product_type]

    if (typeof productKey === 'undefined')
        throw Error(`Product type ${product_type} not configured for serialization`)

    const serialized = await serializeProduct(productKey, page)
    await browser.close()
    return serialized

}

async function serializeProduct<T extends keyof PrismaModelMap>(
    productType: T,
    page: Page
) {
    const serialized: Partial<PrismaModelMap[T]> = {}
    const map = untypedMap as unknown as UniversalSerializationMap
    const specs = await page.$$('.xs-hide .group--spec')
    serialized.url = page.url()

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
            (s) => s.childNodes[3]?.textContent?.trim()
        )
        //
        if (specValue == null || specValue.trim() === '') {
            // serialized[snakeSpecName] = null
            throw new Error(`Spec '${specName}' cannot be undefined or empty`)
        } else if (mappedSpecSerializationType === 'custom') {
            serialized[snakeSpecName] =
                customSerializers[productType]![snakeSpecName]!(specValue)
        } else {
            serialized[snakeSpecName] = genericSerialize(
                specValue,
                mappedSpecSerializationType
            )
        }

    }
    switch (productType) {
        case 'cpu':
            return await saveCpu(serialized as unknown as PrismaModelMap['cpu'])
        case 'gpu':
            return await saveGpu(serialized as unknown as PrismaModelMap['gpu'])
        default:
            break;
    }
}

async function saveCpu(specs: PrismaModelMap['cpu']) {
    return await prisma.cpu.create({
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
                    product_type: 'CPU',
                    url: specs.url
                }
            },
            part_number: specs.part_number,
            series: specs.series,
            microarchitecture: specs.microarchitecture,
            core_family: specs.core_family,
            socket: specs.socket,
            core_count: specs.core_count,
            thread_count: specs.thread_count,
            performance_core_clock_ghz: specs.performance_core_clock_ghz,
            performance_core_boost_clock_ghz: specs.performance_core_boost_clock_ghz,
            l2_cache_mb: specs.l2_cache_mb,
            l3_cache_mb: specs.l3_cache_mb,
            tdp_w: specs.tdp_w,
            integrated_graphics: specs.integrated_graphics,
            maximum_supported_memory_gb: specs.maximum_supported_memory_gb,
            ecc_support: specs.ecc_support,
            includes_cooler: specs.includes_cooler,
            packaging: specs.packaging,
            lithography_nm: specs.lithography_nm,
            includes_cpu_cooler: specs.includes_cpu_cooler,
            simultaneous_multithreading: specs.simultaneous_multithreading,

        },
        include: { product: true }
    })
}

async function saveGpu(specs: PrismaModelMap['gpu']) {
    return await prisma.gpu.create({
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
                    product_type: 'GPU',
                    url: specs.url
                }
            },
            part_number: specs.part_number,
            chipset: specs.chipset,
            memory_gb: specs.memory_gb,
            memory_type: specs.memory_type,
            core_clock_mhz: specs.core_clock_mhz,
            boost_clock_mhz: specs.boost_clock_mhz,
            effective_memory_clock_mhz: specs.effective_memory_clock_mhz,
            interface: specs.interface,
            color: specs.color,
            frame_sync: specs.frame_sync,
            length_mm: specs.length_mm,
            tdp_w: specs.tdp_w,
            case_expansion_slot_width: specs.case_expansion_slot_width,
            total_slot_width: specs.total_slot_width,
            cooling: specs.cooling,
            external_power: specs.external_power,
            hdmi_outputs: specs.hdmi_outputs,
            displayport_outputs: specs.displayport_outputs

        },
        include: { product: true }
    })
}

export async function scrapeAmdMobaChipsets(url: string) {
    //this function scans inidividual table in a specific amd intel page and saves to database all of them

    const brand = await upsertBrand('AMD')

    // await prisma.mobaChipset.deleteMany({
    //     where: {brand_id: brand.id}
    // })

    const [browser, page] = await getPuppeteerInstance(url, '.table-responsive')
    type mobaAmdChipsetIndexes = {
        chipset: number,
        cpu_oc: number,
        max_sata_ports: number,
        max_usb_10_gbps: number,
        max_usb_20_gbps: number | null,
        max_usb_5_gbps: number,
        memory_oc: number | null,
        pci_generation: number,
        usb_4_guaranteed: number | null
    }
    const specIndexes: Record<string, mobaAmdChipsetIndexes> = {
        am4: {
            chipset: 0,
            cpu_oc: 8,
            max_sata_ports: 3,
            max_usb_10_gbps: 2,
            max_usb_20_gbps: null,
            max_usb_5_gbps: 1,
            memory_oc: null,
            pci_generation: 6,
            usb_4_guaranteed: null
        },
        am5: {
            chipset: 0,
            cpu_oc: 4,
            max_sata_ports: 9,
            max_usb_10_gbps: 7,
            max_usb_20_gbps: 8,
            max_usb_5_gbps: 6,
            memory_oc: 5,
            pci_generation: 1,
            usb_4_guaranteed: 10
        }
    }

    const urlSegments = url.split('/')
    const cpuChipset = urlSegments.pop()?.replace('.html', '')

    if (typeof cpuChipset === 'undefined' || typeof specIndexes[cpuChipset] === 'undefined')
        throw Error(`Chipset ${cpuChipset} not found`)


    const table = (await page.$$(`table`))[cpuChipset === "am4" ? 1 : 0]

    const rows = (await table.evaluate(async (table) => {
        return Array.from(table.rows).slice(2).map((row) => {
            return Array.from(row.cells).map((cell) => {
                cell.querySelector('sup')?.remove()
                return cell.innerText
            })
        })
    })).filter((row) => row.length > 4)

    await browser.close()

    const data: MobaChipsetSpecs[] = rows.map((row) => {
        const indexes = specIndexes[cpuChipset]

        const getString = (index: number) => {
            return row[index].replaceAll(/["*]/g, '').toLowerCase().trim()
        }
        const getNumber = (index: number | null) => {
            if (index === null) return 0
            const number = serializeNumber(row[index])
            return number ?? 0;
        }

        const getBoolean = (index: number | null) => {
            const booleanValues: Record<string, boolean> = {
                yes: true,
                standard: true,
                optional: false,
                no: false
            }
            if (index === null) return false
            const value = getString(index)
            if (booleanValues[value] === undefined)
                throw Error(`Boolean value for ${value} for amd chipset unknown`)
            return booleanValues[value]
        }

        const customFormatters = {
            pci_generation: (index: number) => {
                const value = row[index].toLowerCase().split("pcie")
                if (value.length <= 1)
                    return 4.0 //some bad columns for am5 are badly coded, but they are all 4th gen
                const number = serializeNumber(value[1])
                if (number === null)
                    throw Error("PCI generation number can't be null")
                return number
            }
        }

        return {
            chipset: getString(indexes.chipset),
            cpu_oc: getBoolean(indexes.cpu_oc),
            max_sata_ports: getNumber(indexes.max_sata_ports),
            max_usb_10_gbps: getNumber(indexes.max_usb_10_gbps),
            max_usb_20_gbps: getNumber(indexes.max_usb_20_gbps),
            max_usb_5_gbps: getNumber(indexes.max_usb_5_gbps),
            memory_oc: getBoolean(indexes.memory_oc),
            usb_4_guaranteed: indexes.usb_4_guaranteed === null ? null : getBoolean(indexes.usb_4_guaranteed),
            pci_generation: new Prisma.Decimal(customFormatters['pci_generation'](indexes.pci_generation)),
            brand_id: brand.id
        }
    })

    return await prisma.mobaChipset.createManyAndReturn({
        data: data
    })
}

export async function scrapeIntelMobaChipsets(url: string) {
    //this function scans the list of intel chipsets and updates database with the ones missing
    const [browser, page] = await getPuppeteerInstance(url, '.table')
    const brand = await upsertBrand('Intel')
    const chipsets = await page.$$eval("table tr > td:first-of-type", (cells) => cells.map((cell) => {
        const a = cell.querySelector('a')
        if (a === null || a.textContent === null)
            throw Error("Error checking Intel chipset")
        return {
            url: a['href'],
            name: a.textContent.split(' ').slice(1, -2).join(' ').trim()
        }
    }))

    if (chipsets.length === 0)
        throw Error("Couldn't find Intel table data")


    await browser.close()
}

async function upsertBrand(brand: string) {
    return prisma.brand.upsert({
        where: { brand: brand },
        update: {},
        create: { brand: brand }
    })
}