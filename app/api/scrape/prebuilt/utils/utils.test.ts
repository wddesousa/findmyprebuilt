import { prismaMock } from "@/app/lib/singleton";
import { describe, expect, test, it, beforeEach } from "vitest";
import { findProductUpdates, prebuiltList, savePrebuiltScrapeResults } from "./utils";
import { cleanedResults } from "../../types";
import { nzxtPrebuiltLinks } from "@/tests/helpers/utils";

describe("findProductUpdates", () => {
  const newPrebuilts = nzxtPrebuiltLinks
  
  const scenarios = [
    {
      name: "identifies a single current product",
      current: [newPrebuilts[0]],
      newPrebuilts,
      expected: {
        ...prebuiltList,
        current: [newPrebuilts[0]],
        new: newPrebuilts.filter((e) => e !== newPrebuilts[0]),
      },
    },
    {
      name: "identifies multiple current products",
      current: [newPrebuilts[0], newPrebuilts[1]],
      newPrebuilts,
      expected: {
        ...prebuiltList,
        current: [newPrebuilts[0], newPrebuilts[1]],
        new: newPrebuilts.filter(
          (e) => e !== newPrebuilts[0] && e !== newPrebuilts[1]
        ),
      },
    },
    {
      name: "detects a deleted product",
      current: [newPrebuilts[0], newPrebuilts[1]],
      newPrebuilts: newPrebuilts.filter((e) => e !== newPrebuilts[0]),
      expected: {
        ...prebuiltList,
        current: [newPrebuilts[0], newPrebuilts[1]],
        new: newPrebuilts.filter(
          (e) => e !== newPrebuilts[0] && e !== newPrebuilts[1]
        ),
        removed: [newPrebuilts[0]],
      },
    },
    {
      name: "detects multiple deleted products",
      current: [newPrebuilts[0], newPrebuilts[1], newPrebuilts[2]],
      newPrebuilts: newPrebuilts.filter(
        (e) => e !== newPrebuilts[0] && e !== newPrebuilts[1]
      ),
      expected: {
        ...prebuiltList,
        current: [newPrebuilts[0], newPrebuilts[1], newPrebuilts[2]],
        new: newPrebuilts.filter(
          (e) => ![newPrebuilts[0], newPrebuilts[1], newPrebuilts[2]].includes(e)
        ),
        removed: [newPrebuilts[0], newPrebuilts[1]],
      },
    },
  ];
  
  test.each(scenarios)("$name", async ({ current, newPrebuilts, expected }) => {
    prismaMock.productTracker.findFirst.mockResolvedValueOnce({
      brand_id: "1",
      current_products_slugs: current,
      id: "1",
      last_scraped_at: new Date(),
    });
    await expect(findProductUpdates("1", newPrebuilts)).resolves.toStrictEqual(
      expected
    );
  });

  it("identifies no current products", async () => {
    await expect(findProductUpdates("1", newPrebuilts)).resolves.toStrictEqual(
        {
            ...prebuiltList,
            new: newPrebuilts
        }
      );
  })
});

describe("savePrebuiltScrapeResults", async () => {
  beforeEach(() => {
    prismaMock.brand.findFirst.mockResolvedValueOnce({id: 'brandid', name: 'testbrand'})
  })
  const cleanedPrebuilt = {rawResults: {url: "theurl.com"}}
  it("creates first track record", async () => {
    await savePrebuiltScrapeResults('newslug.com', cleanedPrebuilt as cleanedResults, "testbrand");

    expect(prismaMock.newProductQueue.create).toHaveBeenCalledWith({
      data: {
        type: "ADD",
        website_url: cleanedPrebuilt.rawResults.url,
        scraped_data: cleanedPrebuilt,
      },
    });
    expect(prismaMock.productTracker.upsert).toHaveBeenCalledWith({
      where: { brand_id: 'brandid' },
      update: {
        current_products_slugs: ["newslug.com"],
        last_scraped_at: expect.any(Date),
      },
      create: {
        brand_id: 'brandid',
        current_products_slugs: ["newslug.com"],
      },
    })
  })

  it ("adds new slug to previous list of slugs", async () => {
    prismaMock.productTracker.findFirst.mockResolvedValueOnce({last_scraped_at: new Date(), brand_id: 'brandid', current_products_slugs: ["oldslug.com"], id: '1'})

    await savePrebuiltScrapeResults('newslug.com', cleanedPrebuilt as cleanedResults, "brandid");
    
    expect(prismaMock.productTracker.upsert).toHaveBeenCalledWith({
      where: { brand_id: 'brandid' },
      update: {
        current_products_slugs: ["oldslug.com", "newslug.com"],
        last_scraped_at: expect.any(Date),
      },
      create: {
        brand_id: 'brandid',
        current_products_slugs: ["oldslug.com", "newslug.com"],
      },
    })
  })
  
})