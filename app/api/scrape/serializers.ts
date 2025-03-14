import {
  DoubleDataRate,
  M2Key,
  MemorySpeed,
  MobaM2Slots,
  Socket,
} from "@prisma/client";
import { MobaChipsetSpecs, PrismaModelMap } from "./types";
import { Page } from "puppeteer";
import { getSpecName, getSpecValue, getTitle } from "./utils";
import { split } from "postcss/lib/list";
import * as cheerio from "cheerio";

const SERIALIZED_VALUES: Record<string, any> = {
  none: false,
  yes: true,
  no: false,
};

const DECIMAL_REGEX = /\d*\.?\d*/g;

export const genericSerialize = (value: string, extractNumber = false) => {
  if (extractNumber) return serializeNumber(value);

  const lower = value.toLowerCase().trim();
  const serialized = SERIALIZED_VALUES[lower];

  return typeof serialized === "undefined" ? value : serialized;
};

export const serializeNumber = (value: string) => {
  const numbers = value.match(DECIMAL_REGEX);
  if (!numbers) return null;

  const matches = numbers.filter((n) => n !== "");
  if (!matches.length) return null;

  return parseFloat(matches[0]!);
};

export const serializeArray = (value: string): any => {
  return value
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => l.trim());
};

const getMemorySpeed = (value: string): MemorySpeed => ({
  id: "",
  speed: parseInt(value.split("-")[1].trim()),
});

//this returns the spec that is added to the actual product name so we know where the real product name ends. For some product we need a function that returns the index of where to cut off the title to get the real product name
const CFM_REGEX = /\d+\.?\d* CFM/g;

export const nameSeparators: Record<
  keyof PrismaModelMap,
  string | (($: cheerio.Root) => Promise<number>)
> = {
  cpu: "Performance Core Clock",
  gpu: "Chipset",
  moba: "Form Factor",
  memory: async ($) => {
    const title = getTitle($);
    return /\(\d x \d+ GB|MB/g.exec(title)?.index ?? title.length;
  },
  storage: "Form Factor",
  cooler: async ($) => {
    //used as a backup in case Model spec is missing
    const title = getTitle($);
    const match = CFM_REGEX.exec(title);
    if (match) return match.index;

    const liquidMatch = /Liquid CPU Cooler$/g.exec(title);
    if (liquidMatch) return liquidMatch.index;

    const coolerMatch = /CPU Cooler$/g.exec(title);
    if (coolerMatch) return coolerMatch.index;

    return title.length;
  },
  psu: "Wattage",
  case: "Type",
  caseFan: async ($) => {
    const title = getTitle($);
    const match = CFM_REGEX.exec(title);
    if (match) return match.index;

    const mmMatch = /\d+mm/g.exec(title);
    if (mmMatch) return mmMatch.index;

    return title.length;
  },
};

export const customSerializers: Partial<{
  [K in keyof PrismaModelMap]: Partial<
    Record<keyof PrismaModelMap[K], (value: string) => any>
  >;
}> = {
  storage: {
    capacity_gb: (value) => {
      const [n, unit] = value.split(" ");

      if (!n || !unit) return null;

      const parsedN = parseFloat(n);

      if (unit === "GB") return parsedN;

      return parsedN * 1000;
    },
  },
  psu: {
    efficiency_rating: (value: string) => {
      const [, rating] = value.split(" ");

      if (typeof rating === "undefined") return null;

      return rating.toUpperCase();
    },
  },
  moba: {
    memory_speed: (value): MemorySpeed[] =>
      serializeArray(value).map(getMemorySpeed),
    m_2_slots: (value): MobaM2Slots[] => {
      const slots = serializeArray(value);
      return slots.map((slot: string) => ({
        id: "",
        size: slot.split(" ")[0].trim(),
        key_type: slot.split(" ")[1].replace("-key", "").trim() as M2Key,
      }));
    },
  },
  memory: {
    memory_speed: getMemorySpeed,
  },
  cooler: {
    cpu_sockets: (value): Socket[] =>
      serializeArray(value).map((spec: string) => ({ id: "", name: spec })),
  },
  case: {
    maximum_video_card_length_mm: (value) =>
      serializeNumber(value.split("mm")[0]),
    volume_ml: (value) => {
      const volume = serializeNumber(serializeArray(value)[0]);
      if (!volume) throw Error("Volume not found for case");
      return volume * 1000;
    },
  },
};

export const mobaChipsetCustomSerializer: Record<
  string,
  Partial<Record<keyof Omit<MobaChipsetSpecs, "name">, (value: string) => any>>
> = {
  intel: {
    usb_4_guaranteed: (value) => (value.includes("4.0") ? false : null),
    pci_generation: (value) => Math.max(...value.trim().split(",").map(Number)),
    cpu_oc: (value) => value.includes("IA"),
  },
};
