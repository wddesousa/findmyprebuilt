import { DoubleDataRate, M2Key, MemorySpeed, MobaM2Slots } from "@prisma/client"
import { MobaChipsetSpecs, PrismaModelMap } from "./types"

const SERIALIZED_VALUES: Record<string, any> = {
	none: null,
	yes: true,
	no: false,
}

const DECIMAL_REGEX = /\d*\.?\d*/g

export const genericSerialize = (value: string, extractNumber = false) => {
	if (extractNumber) return serializeNumber(value)

	const lower = value.toLowerCase().trim()
	const serialized = SERIALIZED_VALUES[lower]

	return typeof serialized === 'undefined' ? value : serialized
}

export const serializeNumber = (value: string) => {
	const numbers = value.match(DECIMAL_REGEX)
	if (!numbers) return null

	const matches = numbers.filter((n) => n !== '')
	if (!matches.length) return null

	return parseFloat(matches[0]!)
}

const splitSpec = (value: string) => {
	return value.split("\n").filter(l => l.trim() !== "").map(l => l.trim())
}

export const customSerializers: Partial<{
	[K in keyof PrismaModelMap]: Partial<Record<keyof PrismaModelMap[K], (value: string) => any>>
}> = {
	// 'hdd': {
	// 	capacity: (value) => {
	// 		const [n, unit] = value.split(' ')

	// 		if (!n || !unit) return null

	// 		const parsedN = parseFloat(n)

	// 		if (unit === 'GB') return parsedN

	// 		return parsedN * 1000
	// 	},
	// 	type: (value) => {
	// 		if (value === 'SSD') return value
	// 		return serializeNumber(value)
	// 	},
	// 	form_factor: (value) => {
	// 		if (value.includes('"')) return serializeNumber(value)

	// 		return value
	// 	},
	// },
	// 'psu': {
	// 	efficiency: (value) => {
	// 		const [, rating] = value.split(' ')

	// 		if (typeof rating === 'undefined') return 'plus'

	// 		return rating.toLowerCase()
	// 	},
	// },
	'gpu': {
		part_number: splitSpec,
	},
	'moba': {
		part_number: splitSpec,
		memory_speed: (value): MemorySpeed[] => {
			const memories = splitSpec(value)
			return memories.map((memory) => ({
				id: '',
				ddr: memory.split('-')[0].trim() as DoubleDataRate,
				speed: parseFloat(memory.split('-')[1].trim())
			}))
		},
		m_2_slots: (value): MobaM2Slots[] => {
			const slots = splitSpec(value)
			return slots.map((slot) => ({
				id: '',
				size: slot.split(' ')[0].trim(),
				key_type: slot.split(' ')[1].replace("-key", "").trim() as M2Key
			}))
		}
	},
}

export const mobaChipsetCustomSerializer: Record<string, Partial<Record<keyof Omit<MobaChipsetSpecs, 'name'>, (value: string) => any>>> = {
	intel: {
		usb_4_guaranteed: (value) =>  value.includes('4.0') ? false : null,
		pci_generation: (value) => Math.max(...value.trim().split(',').map(Number)),
		cpu_oc: (value) => value.includes('IA')
	}
}