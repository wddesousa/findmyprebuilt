import {describe, expect, test} from 'vitest'
import { scrapeAndSavePart } from '@/app/api/scrapers/utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
describe('parts specs scraper', async () => {
    try {
        await prisma.product.deleteMany({ where: {
            product_name: {
              in: ['GeForce RTX 3060 Ventus 2X 12G', 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor']
            }
        } })
    } catch {}

    test('cpu', async () => {
        const cpu = await scrapeAndSavePart('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')

    expect(cpu).toMatchObject({
        part_number: '100-100000910WOF',
        series: 'AMD Ryzen 7',
        microarchitecture: 'Zen 4',
        core_family: 'Raphael',
        socket: 'AM5',
        core_count: 8,
        thread_count: 16,
        performance_core_clock_ghz: 4.2,
        performance_core_boost_clock_ghz: 5,
        l2_cache_mb: 8,
        l3_cache_mb: 96,
        tdp_w: 120,
        integrated_graphics: 'Radeon',
        maximum_supported_memory_gb: 128,
        ecc_support: true,
        includes_cooler: false,
        packaging: 'Boxed',
        lithography_nm: 5,
        includes_cpu_cooler: false,
        simultaneous_multithreading: true,
        product: {
          product_name: 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor',
          product_type: 'CPU',
          url: 'https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof'
        }
      })
    })

    test('gpu', async () => {

        const gpu = await scrapeAndSavePart('https://pcpartpicker.com/product/pD8bt6/msi-geforce-rtx-3060-ventus-2x-12g-geforce-rtx-3060-12gb-12-gb-video-card-rtx3060ventus2x12goc')
        expect(gpu).toMatchObject({
           boost_clock_mhz: 1777,
           case_expansion_slot_width: 2,
           chipset: "GeForce RTX 3060 12GB",
           color: "Black",
           cooling: 2,
           core_clock_mhz: 1320,
           displayport_outputs: 3,
           effective_memory_clock_mhz: 15000,
           external_power: "1 PCIe 8-pin",
           frame_sync: "G-Sync",
           hdmi_outputs: 1,
           interface: "PCIe x16",
           length_mm: 235,
           memory_gb: 12,
           memory_type: "GDDR6",
           part_number: [
             "RTX3060Ventus2X12GOC",
             "GeForce RTX 3060 VENTUS 2X 12G OC",
             "V397-022R",
             "912-V397-039",
           ],
           product: {
             product_name: "GeForce RTX 3060 Ventus 2X 12G",
             product_type: "GPU",
             url: "https://pcpartpicker.com/product/pD8bt6/msi-geforce-rtx-3060-ventus-2x-12g-geforce-rtx-3060-12gb-12-gb-video-card-rtx3060ventus2x12goc",
           },
           tdp_w: 170,
           total_slot_width: 2,
        })
    })
    
    // test('moba', async () => {
    //   const moba = await scrapeAndSavePart('https://pcpartpicker.com/product/pLtLrH/gigabyte-x870e-aorus-elite-wifi7-atx-am5-motherboard-x870e-aorus-elite-wifi7')
    //   expect(moba).toMatchObject({product_name: 'test'})
    // })

})