import { Cpu, Moba, Gpu, Case, Memory } from '@prisma/client'; // Adjust based on your models

export type PartType =
    | 'cpu'
    | 'moba'
    | 'case'
    | 'gpu'
    | 'memory'
    | 'ssd'
    | 'hdd'

export type Part = Record<string, any>

export type MappedSerialization = [string, boolean | 'custom']

type SerializationMap<T> = Record<
	PartType,
	Record<keyof T, MappedSerialization>
>

export type CpuSerializationmap = SerializationMap<Cpu>
