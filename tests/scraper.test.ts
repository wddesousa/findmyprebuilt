import { describe, expect, test, beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import {
  cleanPrebuiltScrapeResults,
  savePrebuiltScrapeResults,
  scrapeAndSavePart,
} from "@/app/api/scrape/utils";
import { CaseFan, Prisma } from "@prisma/client";
import { prismaMock } from "@/app/singleton"

import { extractUsbNumbers } from "@/app/api/scrape/mobachipsets/utils";
import { mobaChipsetCustomSerializer } from "@/app/api/scrape/serializers";
import { nzxtFind } from "@/app/api/scrape/prebuilt/nzxt/scraper";

import { scrapeNzxt } from "@/app/api/scrape/prebuilt/nzxt/scraper";
import { NzxtCategorySpecMap } from "@/app/api/scrape/prebuilt/nzxt/types";
import { cleanedResults } from "@/app/api/scrape/types";
import prisma from './helpers/prisma'
import { airCoolerResult, caseFanResult, caseResult, cleanPrebuiltScrapeResultSet, cpuResult, getFile, gpuResult, hddStorageResult, liquidCoolerResult, memoryResult, mobaResult, psuResult, ssdStorageResult } from "./helpers/utils";
import { prebuiltList } from "@/app/api/scrape/prebuilt/utils";
import { saveCaseFan } from "@/app/api/scrape/db";


