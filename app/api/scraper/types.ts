import { ProductType, Cpu, Moba, Gpu, Case, Memory } from '@prisma/client'; // Adjust based on your models
import type { Prisma } from '@prisma/client';
export type PartType =
    | 'cpu'
    | 'moba'
    | 'case'
    | 'gpu'
    | 'memory'

export type Part = Record<string, any>

export type PrismaModelMap = {
    cpu: Omit<Cpu, 'product_id'>;
    gpu: Omit<Gpu, 'product_id'>;
  };


export type MappedSerialization<T> = [keyof T, boolean | 'custom']

export type UniversalSerializationMap = {
    [K in keyof PrismaModelMap]: Record<string, MappedSerialization<PrismaModelMap[K]>>;
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
