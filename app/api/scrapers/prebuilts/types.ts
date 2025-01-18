import {Case, CaseFan, Cooler, Cpu, Gpu, Memory, Moba, Prebuilt, Prisma, Product, Psu} from "@prisma/client";

export type scraperResults = {
    prebuilt: {[K in keyof Prebuilt]: Prebuilt[K] | null},
    cpu: {
        raw: string,
        part: Product & Cpu
    }
    gpu: {
        raw: string,
        part: Product & Gpu
    }
    ram: {
        raw: string,
        part: Product & Memory
    }
    main_storage: {
        raw: string,
        part: Product & Storage
    }
    second_storage?: {
        raw: string,
        part: Product & Storage
    }
    moba: {
        raw: string,
        part: Product & Moba
    }
    psu: {
        raw: string,
        part: Product & Psu
    }
    case: {
        raw: string,
        part: Product & Case
    }
    front_fan: {
        raw: string,
        part: Product & CaseFan
    }
    rear_fan: {
        raw: string,
        part: Product & CaseFan
    }
    cpu_cooler: {
        raw: string,
        part: Product & Cooler
    }
}

export type nzxtSpecs = {
    specCategory: string,
    specValues: Record<string, string>
  }