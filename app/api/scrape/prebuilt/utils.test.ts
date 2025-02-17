import { prismaMock } from "@/app/singleton";
import { describe, expect, test, it } from "vitest";
import { findProductUpdates, prebuiltList } from "./utils";

describe("findProductUpdates", () => {

const newPrebuilts = [
    "https://nzxt.com/product/player-pc-5080",
    "https://nzxt.com/product/player-pc-5090",
    "https://nzxt.com/product/player-one",
    "https://nzxt.com/product/player-two",
    "https://nzxt.com/product/player-three",
    "https://nzxt.com/product/player-one-prime",
    "https://nzxt.com/product/player-two-prime",
    "https://nzxt.com/product/player-three-prime",
  ];
  
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
      current_products_slugs: current.join(";"),
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
