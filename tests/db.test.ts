import { describe, expect, test } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getProduct } from "@/app/db";
const prisma = new PrismaClient();

test("db querying functions", async () => {
  // expect(await getProduct("Intel", "i5-12400F")).toMatchObject({test: test});
});
