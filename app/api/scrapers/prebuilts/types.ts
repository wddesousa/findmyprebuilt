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

export type scraperRawResults = {
  // The result from scrapers. Each value should be serializable later on by the main serializer that is used for all scrapers
  prebuilt: {
    [K in keyof {
      [P in keyof Prebuilt as P extends `${string}_id` ? never : P]: Prebuilt[P];
    }]: string | null | undefined;
  } & {
    psu_efficiency_rating: string;
    cpu_cooler_type: string;
    case_moba_form_factors: string;
  };
  prebuiltParts: { [K in keyof PartsMap]: string };
};
