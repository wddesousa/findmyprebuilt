import { Queue, Worker, Job } from "bullmq";
import { redis } from "../../../../redis";
import { scrapeProductDetails, updateProductInDB } from "./utils";

// Create a queue
export const scrapeQueue = new Queue("prebuiltScrapeQueue", { connection: redis });

// Function to add a product scraping job
export async function addScrapingJob(productId: string, productUrl: string) {
  await scrapeQueue.add("scrape-product", { productId, productUrl });
}

// Worker to process the queue
const worker = new Worker(
  "prebuiltScrapeQueue",
  async (job: Job) => {
    const { productId, productUrl } = job.data;
    console.log(`Scraping product: ${productUrl}`);

    // Scrape product details
    const details = await scrapeProductDetails(productUrl);

    // Save to database
    await updateProductInDB(productId, details);
    console.log(`Updated product ${productId}`);
  },
  { connection: redis }
);

// Handle worker errors
worker.on("failed", (job, err) => {
  console.error(`Job failed for product ${job?.data?.productId}:`, err);
});
