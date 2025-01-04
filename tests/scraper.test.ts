import {describe, expect, test} from 'vitest'
import { scrapeAndSavePart } from '@/app/api/scrapers/utils'
import { PrismaClient } from '@prisma/client'
import { extractUsbNumbers } from '@/app/api/scrapers/mobachipsets/utils'
import { mobaChipsetCustomSerializer } from '@/app/api/scrapers/serializers'

const prisma = new PrismaClient()

test('correctly extracts usb number', () => {
  var string = '\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.2 Ports- Up to 4 USB 3.2 Gen 2x2 (20Gb/s) Ports- Up to 10 USB 3.2 Gen 2x1 (10Gb/s) Ports- Up to 2 USB 3.2 Gen 1x1 (5Gb/s) Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    '
  expect(extractUsbNumbers(string, '20', 'speed')).toEqual(4)
  expect(extractUsbNumbers(string, '10', 'speed')).toEqual(10)
  expect(extractUsbNumbers(string, '5', 'speed')).toEqual(2)
  expect(extractUsbNumbers(string, '342', 'speed')).toEqual(0)
  
  string = 
  '\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.0 Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    '
  expect(extractUsbNumbers(string, '3.0', 'version')).toEqual(10)
  expect(extractUsbNumbers(string, '2.0', 'version')).toEqual(14)

})

test('correcly extract pci generation', () => {
  expect(mobaChipsetCustomSerializer['intel']['pci_generation']!('\n                                                        \n                                                            \n                                                            \n                                                                3.0, 4.0\n                                                            \n                                                        \n                                                    ')).toBe(4)
  
  expect(mobaChipsetCustomSerializer['intel']['pci_generation']!('\n                                                        \n                                                            \n                                                            \n                                                                3.0\n                                                            \n                                                        \n                                                    ')).toBe(3)
})
// describe('parts specs scraper', async () => {
//     try {
//         await prisma.product.deleteMany({ where: {
//             name: {
//               in: ['GeForce RTX 3060 Ventus 2X 12G', 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor']
//             }
//         } })
//     } catch {}

//     test('cpu', async () => {
//         const cpu = await scrapeAndSavePart('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')

//     expect(cpu).toMatchObject({
//         part_number: '100-100000910WOF',
//         series: 'AMD Ryzen 7',
//         microarchitecture: 'Zen 4',
//         core_family: 'Raphael',
//         core_count: 8,
//         thread_count: 16,
//         performance_core_clock_ghz: 4.2,
//         performance_core_boost_clock_ghz: 5,
//         l2_cache_mb: 8,
//         l3_cache_mb: 96,
//         tdp_w: 120,
//         integrated_graphics: 'Radeon',
//         maximum_supported_memory_gb: 128,
//         ecc_support: true,
//         includes_cooler: false,
//         packaging: 'Boxed',
//         lithography_nm: 5,
//         includes_cpu_cooler: false,
//         simultaneous_multithreading: true,
//         product: {
//           name: 'AMD Ryzen 7 7800X3D 4.2 GHz 8-Core Processor',
//           type: 'CPU',
//           url: 'https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof'
//         },
//         socket: {
//           name: 'AM5',
//         }
//       })
//     })

//     test('gpu', async () => {

//         const gpu = await scrapeAndSavePart('https://pcpartpicker.com/product/pD8bt6/msi-geforce-rtx-3060-ventus-2x-12g-geforce-rtx-3060-12gb-12-gb-video-card-rtx3060ventus2x12goc')
//         expect(gpu).toMatchObject({
//            boost_clock_mhz: 1777,
//            case_expansion_slot_width: 2,
//            chipset: "GeForce RTX 3060 12GB",
//            color: "Black",
//            cooling: 2,
//            core_clock_mhz: 1320,
//            displayport_outputs: 3,
//            effective_memory_clock_mhz: 15000,
//            external_power: "1 PCIe 8-pin",
//            frame_sync: "G-Sync",
//            hdmi_outputs: 1,
//            interface: "PCIe x16",
//            length_mm: 235,
//            memory_gb: 12,
//            memory_type: "GDDR6",
//            part_number: [
//              "RTX3060Ventus2X12GOC",
//              "GeForce RTX 3060 VENTUS 2X 12G OC",
//              "V397-022R",
//              "912-V397-039",
//            ],
//            product: {
//              name: "GeForce RTX 3060 Ventus 2X 12G",
//              type: "GPU",
//              url: "https://pcpartpicker.com/product/pD8bt6/msi-geforce-rtx-3060-ventus-2x-12g-geforce-rtx-3060-12gb-12-gb-video-card-rtx3060ventus2x12goc",
//            },
//            tdp_w: 170,
//            total_slot_width: 2,
//         })
//     })
    
//     // test('moba', async () => {
//     //   const moba = await scrapeAndSavePart('https://pcpartpicker.com/product/pLtLrH/gigabyte-x870e-aorus-elite-wifi7-atx-am5-motherboard-x870e-aorus-elite-wifi7')
//     //   expect(moba).toMatchObject({product_name: 'test'})
//     // })

// })