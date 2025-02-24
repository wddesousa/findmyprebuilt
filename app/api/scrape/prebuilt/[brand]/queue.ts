import { Queue } from "bullmq";
import { redis } from "../../../../redis";
import { Brand } from "@prisma/client";


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