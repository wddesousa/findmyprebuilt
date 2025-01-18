import { getPuppeteerInstance } from "@/app/api/scrapers/utils";
import prisma from "@/app/db";
import { scraperResults, nzxtSpecs } from "./types";
import { ScriptHTMLAttributes } from "react";
import {serializeNumber} from "@/app/api/scrapers/serializers";

export async function nzxt(url: string): scraperResults {
const [browser, page] = await getPuppeteerInstance(url, ".relative");


  const title = await page.title();
  
  const pageInfo = await page.$eval('#__NEXT_DATA__', (el) => {
    if (!el || !el.textContent) throw Error('No script found');
    return JSON.parse(el.textContent);
  })

  const specs = pageInfo.props.pageProps.data.techTable as nzxtSpecs[]
  console.log(specs)
  
  const psuSpecs = specs.find(spec => spec.specCategory === 'Power')?.specValues as {Model: string; Wattage: string} ?? {}
  
  return {
    prebuilt: {
      psu_tw: serializeNumber(psuSpecs.Wattage),
    }
    psu: {
      raw: JSON.stringify(psuSpecs),
      part: 
  }
  await browser.close();
}
  