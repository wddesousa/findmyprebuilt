import {describe, expect, test} from 'vitest'
import { scrapeAndSavePart } from '@/app/api/scrapers/utils'
import { Prisma, PrismaClient } from '@prisma/client'
import { extractUsbNumbers } from '@/app/api/scrapers/mobachipsets/utils'
import { mobaChipsetCustomSerializer } from '@/app/api/scrapers/serializers'
import path from 'path'
import { PrismaModelMap } from '@/app/api/scrapers/types'

const prisma = new PrismaClient()
const DATA_FOLDER = path.join(__dirname, './data')

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
describe('parts specs scraper', async () => {
  const getFile = (filename: string) => `file://${DATA_FOLDER}/${filename}`

    try {
        await prisma.product.deleteMany({ where: {
            url: {
              startsWith: 'file://'
            }
        } })
    } catch (error: any) {
      if (error.code !== 'P2025') {
        console.error(error)
        process.exit(error.code)
      }
    }

    test('cooler', async () => {
      const tests: Record<string, Record<string, any>> = {
        cooler: {
          part_number: [ 'ACFRE00124A' ],
          fan_rpm: '200 - 2000 RPM',
          color: 'Black',
          height_mm: 159,
          water_cooled_radiador_mm: null,
          fanless: false,
          product: {
            name: 'Freezer 36 A-RGB',
            type: 'COOLER',
            url: getFile('cooler.html'),
            asin: null,
            brand: { name: 'ARCTIC' }
          },
          cpu_sockets: [
            { name: 'LGA1851' },
            { name: 'AM5' },
            { name: 'AM4' },
            { name: 'LGA1700' }
          ]
        },
        liquid_cooler: {
          part_number: [ 'CW-9060073-WW' ],
          fan_rpm: '550 - 2100 RPM',
          color: 'White',
          height_mm: null,
          water_cooled_radiador_mm: 360,
          fanless: false,
          product: {
            name: 'iCUE H150i ELITE CAPELLIX XT',
            type: 'COOLER',
            url: getFile('liquid_cooler.html'),
            asin: null,
            brand: { name: 'Corsair' }
          },
          cpu_sockets: [
            { name: 'LGA1851' },
            { name: 'AM5' },
            { name: 'AM4' },
            { name: 'LGA1700' },
            { name: 'sTR4' },
            { name: 'sTRX4' },
            { name: 'LGA1150' },
            { name: 'LGA1151' },
            { name: 'LGA1155' },
            { name: 'LGA1156' },
            { name: 'LGA1200' },
            { name: 'LGA2011' },
            { name: 'LGA2011-3' },
            { name: 'LGA2066' }
          ]
        }
      }
      const promises = Object.keys(tests).map(async (file) => {

        const cooler = await scrapeAndSavePart(getFile(`${file}.html`)) as unknown as PrismaModelMap['cooler']
        console.log(cooler)
        expect(cooler).toMatchObject(tests[file])  
      })
      await Promise.all(promises)
    })
    
    test('storage', async () => {
      const tests: Record<string, Record<string, any>> = {
        storage_hdd: {
          part_number: [ 'ST24000NT002' ],
          capacity_gb: 24000,
          form_factor: '3.5"',
          interface: 'SATA 6.0 Gb/s',
          nvme: false,
          product: {
            name: 'IronWolf Pro 24 TB',
            type: 'STORAGE',
            asin: null,
            brand: { name: 'Seagate' }
          },
          storage_type: { name: '7200 RPM' }
        },
        storage_ssd: {
          part_number: [ 'SKC3000S/1024G' ],
          capacity_gb: 1024,
          form_factor: 'M.2-2280',
          interface: 'M.2 PCIe 4.0 X4',
          nvme: true,
          product: {
            name: 'KC3000 1.024 TB',
            type: 'STORAGE',
            asin: null,
            brand: { name: 'Kingston' }
          },
          storage_type: { name: 'SSD' }
        }
      }
      const promises = Object.keys(tests).map(async (file) => {

        const storage = await scrapeAndSavePart(getFile(`${file}.html`)) as unknown as PrismaModelMap['storage']
        // console.log(storage)
        expect(storage).toMatchObject(tests[file])  
      })
      await Promise.all(promises)
    })

    test('cpu', async () => {
      const file = getFile("cpu.html")
      const cpu = await scrapeAndSavePart(file)

    expect(cpu).toMatchObject({
        part_number: '100-100000910WOF',
        series: 'AMD Ryzen 7',
        microarchitecture: 'Zen 4',
        core_family: 'Raphael',
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
          name: 'Ryzen 7 7800X3D',
          type: 'CPU',
          url: file,
          brand: { name: 'AMD' }
        },
        socket: {
          name: 'AM5',
        }
      })
    })

    test('gpu', async () => {
        const file = getFile("gpu.html")
        const gpu = await scrapeAndSavePart(file)
        expect(gpu).toMatchObject({
           boost_clock_mhz: 1777,
           case_expansion_slot_width: 2,
           chipset: {
            name: "GeForce RTX 3060 12GB",
           },
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
             name: "GeForce RTX 3060 Ventus 2X 12G",
             type: "GPU",
             url: file,
             brand: { name: 'MSI' }
           },
           tdp_w: 170,
           total_slot_width: 2,
        })
    })
    
    test('moba', async () => {
      const file = getFile("moba.html")
      const moba = await scrapeAndSavePart(file) as unknown as PrismaModelMap['moba']
      expect(moba).toMatchObject(
        {
          part_number: [ 'Z890 Steel Legend WiFi', '90-MXBPF0-A0UAYZ' ],
          memory_max: 256,
          memory_slots: 4,
          color: 'Silver',
          pcie_x16_slots: 2,
          pcie_x8_slots: 0,
          pcie_x_slots: 1,
          pcie_x1_slots: 0,
          pci_slots: 0,
          mini_pcie_slots: 0,
          half_mini_pcie_slots: 0,
          mini_pcie_msata_slots: 0,
          msata_slots: 0,
          sata_6_0_gbs: 4,
          onboard_ethernet: '1 x 2.5 Gb/s (Realtek Dragon RTL8125BG)',
          onboard_video: 'Depends on CPU',
          usb_2_0_headers: 2,
          usb_2_0_headers_single_port: 0,
          usb_3_2_gen_1_headers: 2,
          usb_3_2_gen_2_headers: 0,
          usb_3_2_gen_2x2_headers: 1,
          supports_ecc: false,
          wireless_networking: 'Wi-Fi 7',
          raid_support: true,
          uses_back_connect_connectors: false,
          product: {
            name: 'Z890 Steel Legend WiFi',
            type: 'MOBA',
            url: file,
            asin: null,
            brand: { name: 'ASRock' }
          },
          chipset: {      
            name: 'Z890',
          },
          memory_speeds: [
            { ddr: 'DDR5', speed: 4400 },
            { ddr: 'DDR5', speed: 4800 },
            { ddr: 'DDR5', speed: 5200 },
            { ddr: 'DDR5', speed: 5600 },
            { ddr: 'DDR5', speed: 6000 },
            { ddr: 'DDR5', speed: 6200 },
            { ddr: 'DDR5', speed: 6400 },
            { ddr: 'DDR5', speed: 6600 },
            { ddr: 'DDR5', speed: 6800 },
            { ddr: 'DDR5', speed: 7000 },
            { ddr: 'DDR5', speed: 7200 },
            { ddr: 'DDR5', speed: 7600 },
            { ddr: 'DDR5', speed: 7800 },
            { ddr: 'DDR5', speed: 8000 },
            { ddr: 'DDR5', speed: 8200 },
            { ddr: 'DDR5', speed: 8400 }
          ],
          moba_form_factor: { name: 'ATX' },
          socket: { name: 'LGA1851' }
        }
      )
      expect(moba['m_2_slots']).toHaveLength(5)
    })

    test('memory', async () => {
      const file = getFile("memory.html")
      const memory = await scrapeAndSavePart(file) as unknown as PrismaModelMap['memory']
      expect(memory).toMatchObject({
        part_number: [ 'CMK16GX4M2B3200C16' ],
        form_factor: '288-pin DIMM (DDR4)',
        modules: '2 x 8GB',
        color: 'Black / Yellow',
        first_word_latency: 10,
        cas_latency: 16,
        voltage: new Prisma.Decimal(1.35),
        timing: '16-18-18-36',
        ecc_registered: 'Non-ECC / Unbuffered',
        heat_spreader: true,
        product: {
          name: 'Vengeance LPX 16 GB',
          type: 'MEMORY',
          url:  file,
          asin: null,
          brand: { name: 'Corsair' }
        },
        memory_speed: { ddr: 'DDR4', speed: 3200 }
      })
    })
})