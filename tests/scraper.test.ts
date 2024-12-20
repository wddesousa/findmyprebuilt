import {describe, expect, test} from 'vitest'
import { scrape_and_save } from '@/app/api/scraper/utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
describe('parts specs scraper', async () => {
    try {
        await prisma.product.delete({ where: {
            product_name: 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor'
        } })
    } catch {}

    test('cpu', async () => {
        const cpu = await scrape_and_save('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')

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

        const gpu = await scrape_and_save('https://pcpartpicker.com/product/pD8bt6/msi-geforce-rtx-3060-ventus-2x-12g-geforce-rtx-3060-12gb-12-gb-video-card-rtx3060ventus2x12goc')

        expect(gpu).toMatchObject({
          product_name: 'MSI GeForce RTX 3060 Ventus 2X 12G GeForce RTX 3060 12GB 12 GB Video Card'
        })
    })
    

})