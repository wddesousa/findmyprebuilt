import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

import { fileURLToPath } from "url";
import { serializeNumber } from "../../serializers";
import { scraperRawResults } from "../../types";
import {
  NzxtSpecCategory,
  NZXTSpecs,
  NzxtCategorySpecMap,
  NzxtSpecValues,
} from "../types/nzxt";
import { getLargestFormFactor } from "../../utils";

export function processNzxtData(data: any, url: string): scraperRawResults {
  const nzxtData = data.props.pageProps.data;
  const specs = nzxtData.techTable as NzxtSpecValues[];
  const baseProductInfo = nzxtData.decoratedDefaultUpgradeProducts[0];
  const images = baseProductInfo.images as { url: string }[];
  const gamePerformance = baseProductInfo.fps;

  const performance = processPerformance(gamePerformance);

  const keySpecs = getNzxtSpecs(specs, "Key Specs");
  const mobaSpecs = getNzxtSpecs(specs, "Motherboard");
  const cpuCoolerSpecs = getNzxtSpecs(specs, "CPU Cooler");
  const psuSpecs = getNzxtSpecs(specs, "Power");
  const caseSpecs = getNzxtSpecs(specs, "Case");
  const warrantySpecs = getNzxtSpecs(specs, "Warranty");
  const rearFanSpecs = getNzxtSpecs(specs, "Cooler Fan");
  const frontFanSpecs = getNzxtSpecs(specs, "Case Fan - Front");
  const caseFormFactor = caseSpecs?.["Motherboard Support"]
    ? caseSpecs["Motherboard Support"].split(",")
    : undefined;
  return {
    prebuilt: {
      base_price: String(baseProductInfo.variant.price),
      customizable: true,
      front_fan_mm: getFanSize(frontFanSpecs),
      rear_fan_mm: getFanSize(rearFanSpecs),
      cpu_cooler_mm: getFanSize(cpuCoolerSpecs),
      cpu_cooler_type: cpuCoolerSpecs?.["Cooling type"],
      moba_form_factor: mobaSpecs?.["Form Factor"],
      case_form_factor: getLargestFormFactor(caseFormFactor),
      os: keySpecs?.["Operating System"],
      warranty_months:
        warrantySpecs && warrantySpecs["Manufacturer's Warranty - Parts"]
          ? String(
              (serializeNumber(
                warrantySpecs["Manufacturer's Warranty - Parts"]
              ) as number) * 12
            )
          : null,
      wireless: undefined,
    },
    prebuiltParts: {
      psu: `${psuSpecs?.Model} ${psuSpecs?.Rating} ${psuSpecs?.Wattage}`,
      cpu: keySpecs?.["CPU"],
      case: caseSpecs?.Model,
      cpu_cooler: cpuCoolerSpecs?.Model,
      gpu: keySpecs?.["GPU"],
      front_fan: frontFanSpecs?.Model,
      rear_fan: rearFanSpecs?.Model,
      main_storage: keySpecs?.["Storage"],
      second_storage: undefined,
      moba: mobaSpecs?.Model,
      ram: keySpecs?.["RAM"],
    },
    specsHtml: JSON.stringify(specs),
    images: images.map((image) => image.url),
    performance: performance,
    url: url,
    name: nzxtData.productName,
    brandName: "NZXT",
  };
}

export function processPerformance(gamePerformance: any) {
  const gameAcronymMap: Record<string, string> = {
    lol: "League of Legends",
    fortnite: "Fortnite",
    gtav: "Grand Theft Auto V",
    cs: "Counter-Strike 2",
    cyberpunk: "Cyberpunk 2077",
    bmw: "Black Myth: Wukong",
    valorant: "Valorant",
  };

  const performance: scraperRawResults["performance"] = Object.keys(
    gamePerformance
  ).reduce((acc, game) => {
    if (game !== "timeSpyOverallScore" && !(game in gameAcronymMap))
      throw Error(`Game ${game} not found in map`);
    return game !== "timeSpyOverallScore"
      ? {
          ...acc,
          [gameAcronymMap[game]]: {
            R1080P: Number(gamePerformance[game]["1080"]),
            R1440P: Number(gamePerformance[game]["1440"].split("(")[0]),
            R2160P: Number(gamePerformance[game]["4k"].split("(")[0]),
          },
        }
      : acc;
  }, {});

  return performance;
}

export async function nzxtFind(url: string): Promise<string[]> {
  let response;
  if (url.includes("file://")) {
    const filePath = fileURLToPath(url);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    response = { data: fileContent };
  } else {
    response = await axios.get(url);
  }

  const $ = cheerio.load(response.data);
  const element = $("#__NEXT_DATA__");

  const jsonData = JSON.parse(element.text()); // Convert string to JSON object

  const productGridCards = jsonData.props.pageProps.category.productGridCards;
  const firstKey = Object.keys(productGridCards)[0];
  const products = productGridCards[firstKey].map(
    (product: any) => `https://nzxt.com/product/${product.slug}`
  );

  return products;
}

// Helper function to get specs with type safety
export function getNzxtSpecs<T extends NzxtSpecCategory>(
  specs: NZXTSpecs,
  category: T
): NzxtCategorySpecMap[T] | null {
  return (
    (specs.find((spec) => spec.specCategory === category)
      ?.specValues as NzxtCategorySpecMap[T]) ?? null
  );
}

export function getFanSize(
  specs:
    | NzxtCategorySpecMap["Cooler Fan"]
    | NzxtCategorySpecMap["CPU Cooler"]
    | null
    | undefined
) {
  if (!specs) return null;

  if ("Fan specs" in specs) {
    const match = specs["Fan specs"]?.match(/(\d) x (\w+\d+\w*)/);

    if (match) {
      const number = match[1] && serializeNumber(match[1]);
      const size = match[2] && serializeNumber(match[2]);
      if (number && size) return String(number * size);
    }
  }

  if ("Dimension" in specs) {
    const size = specs.Dimension.split("x")[0];
    return size.trim();
  }
  return null;
}
