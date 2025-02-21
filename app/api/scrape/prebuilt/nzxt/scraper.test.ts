import { describe } from "vitest";
import { expect, it } from "vitest";
import { getFanSize, nzxtFind, scrapeNzxt } from "./scraper";
import { prebuiltList } from "../utils";
import { air, fan, getFile, liquid, scrapeNzxtResults } from "@/tests/helpers/utils";
import { NzxtCategorySpecMap } from "./types";

describe("nzxtFind", async () => {
  const newPrebuilts = [
    "https://nzxt.com/product/player-one",
    "https://nzxt.com/product/player-two",
    "https://nzxt.com/product/player-three",
    "https://nzxt.com/product/player-one-prime",
    "https://nzxt.com/product/player-two-prime",
    "https://nzxt.com/product/player-three-prime",
  ]

  it("finds new prebuilts", async () => {
    await expect(
      nzxtFind(getFile("nzxt-list-alt.html"))
    ).resolves.toStrictEqual({...prebuiltList, new: newPrebuilts});
  });
});

  
describe("getFanSize", async () => {
  it("correctly extracts fan size", async () => {
    expect(getFanSize(air)).toBe("120");
    expect(getFanSize(fan)).toBe("120");
    expect(
      getFanSize(liquid as unknown as NzxtCategorySpecMap["CPU Cooler"])
    ).toBe("280");
  });
});

describe("scrapeNzxt", async () => {
  it("scrapes prebuilt", async () => {
    const file = getFile("nzxt.html");
    const nzxt = await scrapeNzxt(file);
    expect(nzxt).toMatchObject(scrapeNzxtResults);
  });
});
