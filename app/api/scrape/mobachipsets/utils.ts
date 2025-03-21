import { upsertBrand } from "../db"
import { getPuppeteerInstance } from "../utils"
import { sleep } from "@/app/lib/utils"
import { MobaChipsetSpecs, MobaChipsetlSerializationMap, mobaAmdChipsetIndexes } from '../types'
import { genericSerialize, mobaChipsetCustomSerializer, serializeNumber } from "../serializers"
import prisma from '@/app/db'
import { Prisma } from '@prisma/client'
import chipsetUntypedMap from './moba-chipset-serialization-map.json'

export async function scrapeAmdMobaChipsets(url: string) {
    //this function scans inidividual table in a specific amd intel page and saves to database all of them

    const brand = await upsertBrand('AMD')

    // await prisma.mobaChipset.deleteMany({
    //     where: {brand_id: brand.id}
    // })

    const [browser, page] = await getPuppeteerInstance(url, '.table-responsive')

    const specIndexes: Record<string, mobaAmdChipsetIndexes> = {
        am4: {
            chipset: 0,
            cpu_oc: 8,
            max_sata_ports: 3,
            max_usb_10_gbps: 2,
            max_usb_20_gbps: null,
            max_usb_5_gbps: null,
            max_usb_2_gen: 1,
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
            max_usb_2_gen: null,
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
            name: getString(indexes.chipset),
            cpu_oc: getBoolean(indexes.cpu_oc),
            max_sata_ports: getNumber(indexes.max_sata_ports),
            max_usb_10_gbps: getNumber(indexes.max_usb_10_gbps),
            max_usb_20_gbps: getNumber(indexes.max_usb_20_gbps),
            max_usb_5_gbps: getNumber(indexes.max_usb_5_gbps),
            max_usb_2_gen: getNumber(indexes.max_usb_2_gen),
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
    const map =  chipsetUntypedMap as unknown as MobaChipsetlSerializationMap
    const chipsets = await page.$$eval("table tr > td:first-of-type", (cells) => cells.map((cell) => {
        const a = cell.querySelector('a')
        if (a === null || a.textContent === null)
            throw Error("Error checking Intel chipset")
        return {
            url: a['href'],
            name: a.textContent.split(' ').slice(1, -1).join(' ').trim()
        }
    }))

    if (chipsets.length === 0)
        throw Error("Couldn't find Intel table data")

    const knownChipsets = await prisma.mobaChipset.findMany({
        select: { name: true },
        where: { brand: { name: "Intel" } }
    })

    const unknownChipsets = chipsets.filter((chipset) => {
        for (const knownChipset of knownChipsets)
            if (knownChipset.name === chipset.name)
                return false
        return true
    })

    const data: MobaChipsetSpecs[] = []

    for (const chipset of unknownChipsets) {
        console.log(`New Intel chipset found (${chipset.name})`)
        const res = await page.goto(chipset.url)
        try {
            await page.waitForSelector('.tech-section-row', { timeout: 5000 })
        } catch {
            console.error(
                `Intel chipset fetch failed (HTTP ${res?.status() ?? '?'
                }). Try running with \`{ headless: false }\` to see what the problem is.`
            )
            throw new Error(`Intel chipset fetch failed (HTTP ${res?.status() ?? '?'
                }). Try running with \`{ headless: false }\` to see what the problem is.`)
        }

        const rows = await page.$$('.tech-section-row')
        const serialized: Partial<MobaChipsetSpecs> = {
            name: chipset.name,
            max_usb_5_gbps: 0,
            max_usb_10_gbps: 0,
            max_usb_20_gbps: 0,
            cpu_oc: false,
            memory_oc: false,
            usb_4_guaranteed: null,
            brand_id: brand.id
        }

        for (const row of rows) {
            const label = await row.$eval('div.tech-label', (label) => label.textContent?.trim())
            const specValue = (await row.$eval('div.tech-data', (value) => value.textContent)) ?? 'unknown'
            
            if (!label) continue
            
            if (map.Intel[label]) {
                const [specLabel, serializationType] = map.Intel[label]

                if (typeof serializationType === 'boolean')
                    serialized[specLabel] = genericSerialize(specValue, serializationType)
                else if (label == "USB Configuration") {
                    if (specValue.includes('3.2')) {
                        serialized['max_usb_5_gbps'] = extractUsbNumbers(specValue, '5', 'speed')
                        serialized['max_usb_10_gbps'] = extractUsbNumbers(specValue, '10', 'speed')
                        serialized['max_usb_20_gbps'] = extractUsbNumbers(specValue, '20', 'speed')
                    } else {
                        serialized['max_usb_5_gbps'] = extractUsbNumbers(specValue, '3.0', 'version')
                    }
                    serialized['max_usb_2_gen'] = extractUsbNumbers(specValue, '2.0', 'version')
                } else {
                    serialized[specLabel] = mobaChipsetCustomSerializer['intel'][specLabel]!(specValue)
                }
            }   
        }
        
        data.push(serialized as MobaChipsetSpecs) 
        await sleep(2000)
    }

    await browser.close()

    return await prisma.mobaChipset.createManyAndReturn({
        data: data
    })
}

export function extractUsbNumbers(string:string, value: string, type: 'speed' | 'version'): number {
    //pass value and type of usb to extract (e.g. 20, speed) for 20 gbps and this will extract the n umber of usb ports from the string
    const regex = new RegExp(type === 'speed' ? `Up to (\\d+) USB [^-]*?${value}Gb/s` : `(\\d+) USB ${value} Ports`, 'm')
    const match = string.match(regex)
    return match ? parseInt(match[1]): 0
}