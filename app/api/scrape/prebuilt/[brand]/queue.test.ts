import { describe, it, expect, afterEach } from "vitest";
import { Queue, Worker, Job } from "bullmq";
import { redis } from "@/app/redis";
import { addPrebuiltScrapingJob } from "./queue";

const queue = new Queue("prebuiltScraperQueue", { connection: redis });

afterEach(async () => {
    await queue.clean(0, 1000, "active");
    queue.obliterate();
})

describe("addPrebuiltScrapingJob", async () => {
  it("adds job to the queue", async () => {
    await addPrebuiltScrapingJob({name: "test", id: "1"}, "test.com");

    // Check that the job is added to the queue
    const jobCount = await queue.count();
    expect(jobCount).toBe(1);
  });
});

// describe("prebuiltScrapeWorker", async () => {
//   it("adds job to the queue", async () => {
//     await addPrebuiltScrapingJob({name: "test", id: "1"}, "test.com");

//     // Check that the job is added to the queue
//     const jobCount = await queue.count();
//     expect(jobCount).toBe(1);
//   });
// });
