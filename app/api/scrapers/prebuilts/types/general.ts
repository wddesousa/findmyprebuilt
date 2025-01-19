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

type ProductSpecs<T> = Product & T;

export type scraperResults = {
  prebuilt: { [K in keyof Prebuilt]: Prebuilt[K] | null };
  cpu: {
    raw: string;
    part: ProductSpecs<Cpu>;
  };
  gpu: {
    raw: string;
    part: ProductSpecs<Gpu>;
  };
  ram: {
    raw: string;
    part: ProductSpecs<Memory>;
  };
  main_storage: {
    raw: string;
    part: ProductSpecs<Storage>;
  };
  second_storage?: {
    raw: string;
    part: ProductSpecs<Storage>;
  };
  moba: {
    raw: string;
    part: ProductSpecs<Moba>;
  };
  psu: {
    raw: string;
    part: ProductSpecs<Psu>;
  };
  case: {
    raw: string;
    part: ProductSpecs<Case>;
  };
  front_fan: {
    raw: string;
    part: ProductSpecs<CaseFan>;
  };
  rear_fan: {
    raw: string;
    part: ProductSpecs<CaseFan>;
  };
  cpu_cooler: {
    raw: string;
    part: ProductSpecs<Cooler>;
  };
};