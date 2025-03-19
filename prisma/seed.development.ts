import prisma from "@/app/db";
import {
  scrapeAmdMobaChipsets,
  scrapeIntelMobaChipsets,
} from "@/app/api/scrape/mobachipsets/utils";
import { prebuiltForUpload } from "./data.development";
import { formFactors, intelChipsets } from "./data"

async function main() {
  // if (!await prisma.mobaChipset.findFirst({where: {brand: {name: 'AMD'}}})) {
  //   console.log("getting AMD chipsets")
  //   await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
  //   await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am5.html')
  // }

  // await scrapeIntelMobaChipsets('https://www.intel.com/content/www/us/en/products/details/chipsets/desktop-chipsets/products.html')
  try {
    await prisma.brand.create({
      data: { name: "Intel", id: intelChipsets[0].brand_id },
    });
  } catch (e) {
    console.log("skipping intel brand");
  }
  try {
    await prisma.mobaChipset.createMany({
      data: intelChipsets,
    });
  } catch (e) {
    console.log("skipping intel chipsets");
  }
  try {
    await prisma.formFactor.createMany({
      data: formFactors,
    });
  } catch (e) {
    console.log("skipping intel chipsets");
  }
    console.log(prebuiltForUpload)
    await prisma.newProductQueue.deleteMany({});
    await prisma.newProductQueue.create({
      data: {
        scraped_data: prebuiltForUpload,
        type: "ADD",
        website_url: "test.com",
      },
    });
  

  await prisma.gpuChipset.upsert({
    where: { name: "GeForce RTX 3050" },
    create: { name: "GeForce RTX 3050" },
    update: { name: "GeForce RTX 3050" },
  });

  try {
    await prisma.storageType.createMany({
      data: [{ name: "SSD" }, { name: "7200 RPM" }],
    });
  } catch (e) {
    console.log("skipping storage types");
  }

    await prisma.cpu.deleteMany();
    await prisma.cpu.create({
      data: 
        {
          core_count:0,
          core_family:'1',
          ecc_support: true,
          includes_cooler: false,
          includes_cpu_cooler: false,
          integrated_graphics: 'test',
          l2_cache_mb:1,
          l3_cache_mb:3,
          lithography_nm:3,
          maximum_supported_memory_gb:4,
          microarchitecture:'zemn',
          packaging: 'l',
          performance_core_boost_clock_ghz: 2,
          performance_core_clock_ghz: 3,
          series: "3",
          simultaneous_multithreading: true,
          tdp_w: 23,
          thread_count: 2,
          part_number: ["test"],
          socket: {create: {
             name: 'imasocket',
          }
        },

          product: {
            create: {
              name: "Core i5-13400F",
              slug: "etst",
              type: "CPU",
              url: 'tets.com',
              scores: ({}),
              brand: {
                connect: {name: "Intel"}
              }
            }
          }

        },
    });
  

  try {
    await prisma.operativeSystem.createMany({
      data: [
        { name: "Windows 11 Home" },
        { name: "Windows 11 Pro" },
        { name: "macOS Monterey" },
        { name: "Ubuntu 20.04 LTS" },
        { name: "Fedora 35" },
        { name: "Chrome OS" },
        { name: "Windows 10" },
      ],
    });
  } catch (e) {}
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
