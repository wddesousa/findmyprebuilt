import { Product, Cpu, Moba, Gpu, Case, Memory, Brand, MobaChipset } from '@prisma/client'; // Adjust based on your models

export type Part = Record<string, any>

export type PrismaModelMap = {
    cpu: Omit<Product & Brand & Cpu, 'product_id' | 'brand_id'>
    gpu: Omit<Product & Brand & Gpu, 'product_id' | 'brand_id'>
  };

export type MappedSerialization<T> = [keyof T, boolean | 'custom']

export type UniversalSerializationMap = {
    [K in keyof PrismaModelMap]: Record<string, MappedSerialization<PrismaModelMap[K]>>;
  };

export type MobaChipsetSpecs = Omit<MobaChipset, 'id'>

// type SerializationMap<T> = Record<
// 	PartType,
// 	Record<keyof T, MappedSerialization<T>>
// >

// export type CpuSerializationmap = SerializationMap<Cpu>
// export type MobaSerializationmap = SerializationMap<Moba>
// export type GpuSerializationmap = SerializationMap<Gpu>
// export type CaseSerializationmap = SerializationMap<Case>
// export type MemorySerializationmap = SerializationMap<Memory>
