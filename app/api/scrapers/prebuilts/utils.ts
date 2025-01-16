import { getPuppeteerInstance } from "@/app/api/scrapers/utils";
import { PrebuiltAttributes } from "@prisma/client";
import prisma from "@/app/db";
import { rawPrebuiltParts } from "./types";

export async function nzxt(url: string): Promise<rawPrebuiltParts> {
const [browser, page] = await getPuppeteerInstance(url, ".relative");


  const title = await page.title();
  console.log(title);
  await browser.close();
}
