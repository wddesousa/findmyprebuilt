import {
  Product,
  Storage,
  Psu,
  Cpu,
  Moba,
  Gpu,
  Socket,
  Case,
  Memory,
  Brand,
  MobaChipset,
  MemorySpeed,
  MobaM2Slots,
  StorageType,
  Cooler,
  FormFactor,
  CaseFan,
  Prebuilt,
} from "@prisma/client"; // Adjust based on your models
import { Decimal } from "@prisma/client/runtime/library";

export type Part = Record<string, any>;

type ProductSpecs = Omit<
  {
    product_name: string;
    socket: string;
    brand: string;
  } & Product,
  "id" | "brand_id" | "name"
>;

export type mobaAmdChipsetIndexes = {
  chipset: number;
  cpu_oc: number;
  max_sata_ports: number;
  max_usb_10_gbps: number;
  max_usb_20_gbps: number | null;
  max_usb_5_gbps: number | null;
  max_usb_2_gen: number | null;
  memory_oc: number | null;
  pci_generation: number;
  usb_4_guaranteed: number | null;
};

export type PrismaModelMap = {
  cpu: ProductSpecs & Cpu;
  gpu: ProductSpecs & Gpu;
  moba: ProductSpecs &
    Moba & { memory_speed: Omit<MemorySpeed[], "id"> } & {
      m_2_slots: Omit<MobaM2Slots[], "id">;
    };
  memory: ProductSpecs & Memory & { memory_speed: Omit<MemorySpeed, "id"> };
  storage: ProductSpecs & Storage;
  cooler: ProductSpecs & Cooler & { cpu_sockets: Omit<Socket[], "id"> };
  psu: ProductSpecs & Psu;
  case: ProductSpecs & Case & { moba_form_factors: string[] };
  caseFan: ProductSpecs & CaseFan;
};

export type MappedSerialization<T> = [keyof T, boolean | "custom" | "array"];

export type MobaChipsetSpecs = Omit<MobaChipset, "id">;

export type UniversalSerializationMap = {
  [K in keyof PrismaModelMap]: Record<
    string,
    MappedSerialization<PrismaModelMap[K]>
  >;
};

export type MobaChipsetlSerializationMap = {
  Intel: Record<string, MappedSerialization<Omit<MobaChipsetSpecs, "name">>>;
};

export type prebuiltScraperFunction = (
  data: any,
  url: string
) => scraperRawResults;

export type prebuiltBrands = "NZXT" | "test";

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

export type rawResult = string | null | undefined;

type gamePerformance = Record<
  string,
  Record<"R1080P" | "R1440P" | "R2160P", number>
>;

export type scraperRawResults = {
  // The result from scrapers. Each value should be serializable later on by the main serializer that is used for all scrapers
  prebuilt: {
    base_price: string;
    customizable: boolean;
    front_fan_mm: rawResult;
    rear_fan_mm: rawResult;
    cpu_cooler_mm: rawResult;
    cpu_cooler_type: rawResult;
    moba_form_factor: rawResult;
    case_form_factor: rawResult;
    os: rawResult;
    warranty_months: rawResult;
    wireless: boolean | null | undefined;
  };
  prebuiltParts: prebuiltParts
  specsHtml: string; //save here the raw hmlt of specs to detect changes in the future
  images: string[];
  performance?: gamePerformance;
  url: string;
  name: string;
  brandName: prebuiltBrands
};

export type prebuiltParts = Record<keyof PartsMap, rawResult> ;

type processedResults = {
  [K in keyof Omit<Prebuilt, "product_id" | "cpu_id" | "specs_html">]:
    | Prebuilt[K]
    | null
    | undefined;
};

export type cleanedResults = {
  rawResults: scraperRawResults;
  processedResults: processedResults & {case_form_factor: rawResult}
};

export type prebuiltTrackerResults = {
  new: string[];
  removed: string[];
  current: string[];
};
