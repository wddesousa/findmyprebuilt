import { describe, it, expect, test } from "vitest";
import { NextRequest } from "next/server";
import * as prebuilt from "@/app/api/scrape/prebuilt/[brand]/route";
import { getFile, nzxtPrebuiltLinks } from "./helpers/utils";
import  prisma from "./helpers/prisma";
import { addProductToQueue, trackProducts } from "@/app/db";
import { upsertBrand } from "@/app/api/scrape/db";

describe("/api", async () => {
  describe("[POST] /scrape/prebuilt/[brand]", () => {
    const headers = new Headers();
    headers.set("prebuilt-cron-secret", "supersecretcrontest");
    const requestInfo = {
      method: "POST",
      body: JSON.stringify({ url: getFile('nzxt-list-alt.html') }),
      headers: headers,
    };
    it("responds with 403 if not authorized", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        {
          method: "POST",
          body: null,
        }
      );

      const params = Promise.resolve({ slug: "" });
      const response = await prebuilt.POST(req, { params });
      expect(response?.status).toBe(403);
    });

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

    describe("throws 400 error if url is not included in body", async () => {
      test.each([
        [
          "null body",
          new NextRequest("http://localhost:3000/api/scrape/prebuilt/[brand]", {
            ...requestInfo,
            body: undefined,
          }),
        ],
        [
          "empty url",
          new NextRequest("http://localhost:3000/api/scrape/prebuilt/[brand]", {
            ...requestInfo,
            body: JSON.stringify({ url: "" }),
          }),
        ],
      ])("%s", async (name, req) => {
        const params = Promise.resolve({ slug: "NZXT" });
        const response = await prebuilt.POST(req, { params });

        expect(response?.status).toBe(400);
      });
    });

    it("adds new prebuilts to database", async () => {
      // TODO: add some brands to test database and test that new ones are added and the old ones are conserved
      await upsertBrand('NZXT');
      // const links = nzxtPrebuiltLinks.slice(1)
      // for (const link of links) {
      //   await addProductToQueue("ADD", link, {} as any);
      // }
      await trackProducts("NZXT", [
        'https://nzxt.com/product/player-two',
        'https://nzxt.com/product/player-three',
        'https://nzxt.com/product/player-one-prime',
        'https://nzxt.com/product/player-two-prime',
        'https://nzxt.com/product/player-three-prime'
      ]);
      const newLink = "https://nzxt.com/product/player-pc-5080"
      const req = new NextRequest(
        "http://localhost:3000/api/scrape/prebuilt/[brand]",
        requestInfo
      );
      const params = Promise.resolve({ slug: "NZXT" });
      const response = await prebuilt.POST(req, { params })
      const data = await response?.json();

      expect(response?.status).toBe(200);
      await expect(prisma.productTracker.findMany()).resolves.toMatchObject( [
         {
          "current_products_slugs": "https://nzxt.com/product/player-two;https://nzxt.com/product/player-three;https://nzxt.com/product/player-one-prime;https://nzxt.com/product/player-two-prime;https://nzxt.com/product/player-three-prime;https://nzxt.com/product/player-one",
        },
      ]);
    }, 70000);
  });
});
 