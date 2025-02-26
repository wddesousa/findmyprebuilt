import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from 'fs';
import * as prebuiltFind from "@/app/api/scrape/prebuilt/[brand]/route";
import * as prebuiltProcess from "@/app/api/scrape/prebuilt/process/[brand]/route";
import nzxtData from './data/nzxt-full-info.json';
import * as pcparts from "@/app/api/scrape/pcparts/route";
import * as pcpartsReceiver from "@/app/api/scrape/pcparts/process/route";
import  prisma from "./helpers/prisma";
import { trackProducts } from "@/app/db";
import { upsertBrand } from "@/app/api/scrape/db";
import { addPrebuiltScrapingJob } from "@/app/api/scrape/prebuilt/[brand]/queue";
import { addPartcrapingJob } from "@/app/api/scrape/pcparts/queue";
import {intelChipsets} from './helpers/utils'
import { Decimal } from "@prisma/client/runtime/library";

describe("/api/scrape", async () => {

  beforeEach(async () => {
    await prisma.brand.create({data: {name: 'test'}})
  })
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
      const response = await prebuiltFind.POST(req, { params });
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
      const response = await prebuiltFind.POST(req, { params })

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
      const response = await prebuiltFind.POST(req, { params })

      expect(response?.status).toBe(200);
      const removeProduct = await prisma.newProductQueue.findMany({where: {type: "REMOVE"}})
      expect(removeProduct.length).toEqual(1);
    })
  });

  describe("[POST] /scrape/prebuilt/process/[brand]", () => {

    it("throws 400 error if body is not complete", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/process/[brand]",
        {...requestInfo, body: '{}'}
      );

      const params = Promise.resolve({ slug: "nZt" });
      const response = await prebuiltProcess.POST(req, { params });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("The following keys are missing from request: url, scrapedData");
    })

    it("throws 400 error if brand is not configured", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/process/[brand]",
        {...requestInfo, body: JSON.stringify({url: 'test.com', scrapedData: {}})}
      );

      const params = Promise.resolve({ slug: "nZt" });
      const response = await prebuiltProcess.POST(req, { params });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("Brand not configured");
    });

    it("saves prebuilt data to database", async () => {

      const url = 'test.com'
      const data = nzxtData
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/process/[brand]",
        {...requestInfo, body: JSON.stringify({url, scrapedData: data})}
      );

      const params = Promise.resolve({ slug: "test" });
      const response = await prebuiltProcess.POST(req, { params });
      expect(response?.status).toBe(200);
      
      const queued = await prisma.newProductQueue.findFirst({where: {type: "ADD"}});
      expect(queued).toMatchObject({scraped_data: expect.any(String), website_url: url})
    })

  })

  describe("[POST] /scrape/pcparts", () => {
    vi.mock("@/app/api/scrape/pcparts/queue.ts", async () => ({
      addPartcrapingJob: vi.fn()
    }))

    it("throws 400 error if body is not complete", async () => {
      const req = new NextRequest(
        "http://localhost:3000",
        {...requestInfo, body: '{}'}
      );

      const response = await pcparts.POST(req);
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("Url missing");
    }) 

    it("calls perbuilt scraper worker", async () => {
      const url = 'test'
      const req = new NextRequest(
        "http://localhost:3000",
        {...requestInfo, body: JSON.stringify({url})}
      );

      const response = await pcparts.POST(req);
      const data = await response?.json();

      expect(addPartcrapingJob).toHaveBeenCalledWith(url);
      expect(response?.status).toBe(200);
      expect(data.message).toBe("success");
    }) 

  })
  describe("[POST] /scrape/pcparts/process", () => {

    it("throws 400 error if body is not complete", async () => {
      const req = new NextRequest(
        "http://localhost:3000",
        {...requestInfo, body: '{}'}
      );

      const response = await pcpartsReceiver.POST(req);
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toBe("The following keys are missing from request: url, scrapedData");
    }) 

    it("processes pc parts scraped data", async () => {
      const url = 'test'
      const data = fs.readFileSync('./tests/data/moba.html', 'utf-8')
      const req = new NextRequest(
        "http://localhost:3000",
        {...requestInfo, body: JSON.stringify({url, scrapedData: data})}
      );

      await prisma.brand.create({data: {name: 'Intel', id: intelChipsets[4].brand_id}})
      await prisma.mobaChipset.create({data: intelChipsets[4]})

      const response = await pcpartsReceiver.POST(req);

      expect(response?.status).toBe(200);
      const moba = await prisma.mobaChipset.findFirst({});
      expect(moba).toMatchObject({...intelChipsets[4], pci_generation: new Decimal(4)})    }) 

  })
});
 