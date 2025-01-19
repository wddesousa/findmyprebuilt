import { getPuppeteerInstance } from "@/app/api/scrapers/utils";
import prisma from "@/app/db";
import { scraperResults } from "./types/general";
import { SpecValues, SpecCategory, CategorySpecMap, NZXTSpecs } from "./types/nzxt";
import { ScriptHTMLAttributes } from "react";
import {serializeNumber} from "@/app/api/scrapers/serializers";
import { get } from "http";
  

export async function scrapeNzxt(url: string): scraperResults {
const [browser, page] = await getPuppeteerInstance(url, ".relative");


  const title = await page.title();
  
  const pageInfo = await page.$eval('#__NEXT_DATA__', (el) => {
    if (!el || !el.textContent) throw Error('No script found');
    return JSON.parse(el.textContent);
  })

  const specs = pageInfo.props.pageProps.data.techTable as SpecValues[]
  

  const keySpecs = getNzxtSpecs(specs, 'Key Specs')
  const softwareSpecs = getNzxtSpecs(specs, 'Software')
  const processorSpecs = getNzxtSpecs(specs, 'Processor')
  const graphicsSpecs = getNzxtSpecs(specs, 'Graphics')
  const memorySpecs = getNzxtSpecs(specs, 'Memory')
  const storageSpecs = getNzxtSpecs(specs, 'Storage')
  const mobaSpecs = getNzxtSpecs(specs, 'Motherboard')
  const cpuSpecs = getNzxtSpecs(specs, 'CPU Cooler')
  const psuSpecs = getNzxtSpecs(specs, 'Power')
  const caseSpecs = getNzxtSpecs(specs, 'Case')
  const warrantySpecs = getNzxtSpecs(specs, 'Warranty')
  
  return {
    prebuilt: {
      psu_tw: psuSpecs ? serializeNumber(psuSpecs.Wattage) : null,
    },
    psu: {
      raw: JSON.stringify(psuSpecs),
      part: 
  }
}
  await browser.close();

}

// Helper function to get specs with type safety
function getNzxtSpecs<T extends SpecCategory>(
  specs: NZXTSpecs,
  category: T
): CategorySpecMap[T] | null {
  return specs.find(spec => spec.specCategory === category)?.specValues as CategorySpecMap[T] ?? null;
}