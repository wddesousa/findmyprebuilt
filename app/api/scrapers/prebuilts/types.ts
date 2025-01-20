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
}

export type scraperResults = {
  prebuilt: { [K in keyof Prebuilt]: Prebuilt[K] | null }
  prebuiltParts: { [K in keyof PartsMap]: string }
};
