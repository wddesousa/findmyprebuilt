import prisma from "@/app/db";
import {
  scrapeAmdMobaChipsets,
  scrapeIntelMobaChipsets,
} from "@/app/api/scrape/mobachipsets/utils";
import { prebuiltForUpload } from "./data.development";
import { intelChipsets } from "./data"

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
    await prisma.newProductQueue.create({
      data: {
        scraped_data: prebuiltForUpload,
        type: "ADD",
        website_url: "test.com",
      },
    });
  } catch {
    console.log("skipped product queue");
  }

  await prisma.gpuChipset.upsert({
    where: { name: "GeForce RTX 3050" },
    create: { name: "GeForce RTX 3050" },
    update: { name: "GeForce RTX 3050" },
  });

  try {
    const speed = await prisma.memorySpeed.create({
      data: { speed: 5200, ddr: "DDR5" },
    });
  } catch (e) {}

  try {
    await prisma.storageType.createMany({
      data: [{ name: "SSD" }, { name: "7200 RPM" }],
    });
  } catch (e) {
    console.log("skipping storage types");
  }

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
