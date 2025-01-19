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
} from "@prisma/client"; // Adjust based on your models

export type Part = Record<string, any>;

type ProductSpecs = Omit<
  {
    product_name: string;
    socket: string;
    brand: string;
  } & Product,
  "product_id" | "brand_id" | "name"
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

// type SerializationMap<T> = Record<
// 	PartType,
// 	Record<keyof T, MappedSerialization<T>>
// >

// export type CpuSerializationmap = SerializationMap<Cpu>
// export type MobaSerializationmap = SerializationMap<Moba>
// export type GpuSerializationmap = SerializationMap<Gpu>
// export type CaseSerializationmap = SerializationMap<Case>
// export type MemorySerializationmap = SerializationMap<Memory>
