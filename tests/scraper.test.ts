import {expect, test} from 'vitest'
import { scrape_and_save } from '@/app/api/scraper/utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
test('scraper', async () => {
    try {
        await prisma.product.delete({ where: {
            product_name: 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor'
        } })
    } catch {}

    const cpu = await scrape_and_save('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')

    expect(cpu, 'crawler and serialization').toMatchObject({
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
        }
      })
})