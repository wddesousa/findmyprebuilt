import {
  Case,
  CaseFan,
  Cooler,
  Cpu,
  Gpu,
  Memory,
  Moba,
  Prebuilt,
  Prisma,
  Product,
  Psu,
} from "@prisma/client";

export type prebuiltBrands = 
| "nzxt"

type PartsMap = {
  cpu: Cpu;
  gpu: Gpu;
  ram: Memory;
  main_storage: Storage;
  second_storage?: Storage;
  moba: Moba;
  psu: Psu;
  case: Case;
  front_fan: CaseFan;
  rear_fan: CaseFan;
  cpu_cooler: Cooler;
};

type rawResult = string | null | undefined;

export type scraperRawResults = {
  // The result from scrapers. Each value should be serializable later on by the main serializer that is used for all scrapers
  prebuilt: {
    customizable: boolean;
    front_fan_mm:  rawResult;
    rear_fan_mm:  rawResult;
    cpu_cooler_mm:  rawResult;
    cpu_cooler_type: rawResult;
    os: rawResult;
    warranty_months: rawResult ;
    wireless: boolean | null | undefined;
  };
  prebuiltParts: { [K in keyof PartsMap]: rawResult };
  specsHtml: string; //save here the raw hmlt of specs to detect changes in the future
  images: string[]
}
;

//TODO: scraperFinalResults from the complete Prebuilt object
