import { Queue } from "bullmq";
import { redis } from "@/app/lib/redis";


// Create a queue
export const scrapeQueue = new Queue("partScraperQueue", { connection: redis });

// Function to add a product scraping job
export async function addPartcrapingJob(
  productUrl: string,
) {
  await scrapeQueue.add(
    `scrape-${productUrl}`,
    { delay: 0 }
  );
}