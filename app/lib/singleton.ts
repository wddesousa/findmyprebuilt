import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";

import prisma from "@/app/db";
import { afterEach, beforeEach, vitest } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vitest.mock("@/app/db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

afterEach(() => {
  cleanup();
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
