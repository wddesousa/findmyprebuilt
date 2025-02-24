import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import * as prebuilt from "@/app/api/scrape/prebuilt/[brand]/route";
import  prisma from "./helpers/prisma";
import { trackProducts } from "@/app/db";
import { upsertBrand } from "@/app/api/scrape/db";
import { addPrebuiltScrapingJob } from "@/app/api/scrape/prebuilt/[brand]/queue";

describe("/api/scrape", async () => {
  const headers = new Headers();
  headers.set("prebuilt-cron-secret", "supersecretcrontest");
  const requestInfo = {
    method: "POST",
    headers: headers,
  };
  describe("[POST] /scrape/prebuilt/[brand]", () => {

    it("throws 400 error if brand is not configured", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        requestInfo
      );

      const params = Promise.resolve({ slug: "nZt" });
      const response = await prebuilt.POST(req, { params });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("Brand not configured");
    });

    it("adds jobs to scrape new prebuilts", async () => {

      vi.mock("@/app/api/scrape/prebuilt/[brand]/queue.ts", () => ({
        addPrebuiltScrapingJob: vi.fn(),
      }));

      const brand = await upsertBrand('test');
      await trackProducts("test", [
        'https://nzxt.com/product/player-two',
        'https://nzxt.com/product/player-three',
        'https://nzxt.com/product/player-one-prime'
      ]);
      // console.log(await prisma.productTracker.findMany())
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        requestInfo
      );
      const params = Promise.resolve({ slug: "test" });
      const response = await prebuilt.POST(req, { params })

      expect(response?.status).toBe(200);
      expect(addPrebuiltScrapingJob).toHaveBeenCalledTimes(3);
      expect(addPrebuiltScrapingJob).toHaveBeenNthCalledWith(2, brand, 'https://nzxt.com/product/player-two-prime');
    });

    it("sets prebuilts to be removed from database", async () => {
      await upsertBrand('test');
      await trackProducts("test", [
        'https://nzxt.com/product/player-two',
        'https://nzxt.com/product/player-three',
        'https://nzxt.com/product/player-one-prime',
        'https://nzxt.com/product/player-two-prime',
        'https://nzxt.com/product/player-three-prime',
        'https://nzxt.com/product/a-removed-product'
      ]);
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        requestInfo
      );
      const params = Promise.resolve({ slug: "test" });
      const response = await prebuilt.POST(req, { params })

      expect(response?.status).toBe(200);
      const removeProduct = await prisma.newProductQueue.findMany({where: {type: "REMOVE"}})
      expect(removeProduct.length).toEqual(1);
    })
  });

  describe("[POST] /scrape/prebuilt/process/[brand]", () => {
    it("throws 400 error if brand is not configured", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        requestInfo
      );

      const params = Promise.resolve({ slug: "nZt" });
      const response = await prebuilt.POST(req, { params });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("Brand not configured");
    });

    it("throws 400 error if body is not complete", async () => {})
    expect(true).toBe(false);

  })
});
 