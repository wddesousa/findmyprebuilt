import { Queue, Worker, Job } from "bullmq";
import { redis } from "../../../../redis";
import { prebuiltScraperFunction } from "../../types";
import { cleanPrebuiltScrapeResults } from "../../utils";
import { savePrebuiltScrapeResults } from "../utils";

// Create a queue
export const scrapeQueue = new Queue("scraperQueue", { connection: redis });

// Function to add a product scraping job
export async function addScrapingJob(brandId: string, productUrl: string, scrape: prebuiltScraperFunction) {
  await scrapeQueue.add("scrape-product", { productUrl, scrape }, { delay: 3000 });
}
type MyData = {brandId:string, productUrl: string, scrape: prebuiltScraperFunction}
// Worker to process the queue
const worker = new Worker<MyData>(
  "scraperQueue",
  async (job: Job<MyData>) => {
    const { brandId, productUrl, scrape } = job.data;
    console.log(`Scraping product: ${productUrl}`);

      const newPrebuilt = await scrape(productUrl);
      const cleanedPrebuilt = await cleanPrebuiltScrapeResults(newPrebuilt);
      await savePrebuiltScrapeResults(productUrl, cleanedPrebuilt, brandId)
    console.log(`Updated product from ${productUrl}`);
  },
  { connection: redis }
);

// Handle worker errors
worker.on("failed", (job, err) => {
  console.error(`Job failed for product at ${job?.data?.productUrl}:`, err);
});
