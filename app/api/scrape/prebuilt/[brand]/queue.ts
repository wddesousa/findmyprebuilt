import { Queue, Worker, Job } from "bullmq";
import { redis } from "../../../../redis";
import { prebuiltBrands, prebuiltScraperFunction } from "../../types";
import { cleanPrebuiltScrapeResults } from "../../utils";
import { savePrebuiltScrapeResults } from "../utils";
import { scrapeNzxt } from "../nzxt/scraper";
import { Brand } from "@prisma/client";


const scrapers: Record<prebuiltBrands, prebuiltScraperFunction> = {
  NZXT: scrapeNzxt,
  test: scrapeNzxt,
};

// Create a queue
export const scrapeQueue = new Queue("prebuiltScraperQueue", { connection: redis });

// Function to add a product scraping job
export async function addPrebuiltScrapingJob(
  brand: Brand,
  productUrl: string,
) {
  await scrapeQueue.add(
    `scrape-${productUrl}`,
    { brand, productUrl },
    { delay: 3000 }
  );
}

export async function prebuiltScrapeWorker(job: Job<MyData>) {
  const { brand, productUrl } = job.data;

  const scrape = scrapers[brand.name as prebuiltBrands];
  if (!scrape) throw new Error(`No scraper found for: ${brand.name}`);
  console.log(`Scraping product: ${productUrl}`);

  const newPrebuilt = await scrape(productUrl);
  const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);
  await savePrebuiltScrapeResults(productUrl, cleanedPrebuilt, brand.id);
  console.log(`Updated product from ${productUrl}`);
}

type MyData = {
  brand: Brand;
  productUrl: string;
};
// Worker to process the queue
const worker = new Worker<MyData>(
  "prebuiltScraperQueue",
  prebuiltScrapeWorker,
  { connection: redis }
);

// Handle worker errors
worker.on("failed", (job, err) => {
  console.error(`Job failed for product at ${job?.data?.productUrl}:`, err);
});
