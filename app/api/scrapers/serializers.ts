import { DoubleDataRate, M2Key, MemorySpeed, MobaM2Slots } from "@prisma/client"
import { MobaChipsetSpecs, PrismaModelMap } from "./types"
import { Page } from "puppeteer"
import { getSpecName, getSpecValue, getTitle } from "./utils"

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

const getMemorySpeed = (value: string): MemorySpeed => (
	{
		id: '',
		ddr: value.split('-')[0].trim() as DoubleDataRate,
		speed: parseFloat(value.split('-')[1].trim())
	}
)

// const nameSeparator = (page: Page, specName: string) => {
// 	const separator = page.$()
// }

//this returns the spec that is added to the actual product name so we know where the real product name ends
export const nameSeparators: Record<keyof PrismaModelMap, string | ((page: Page) => Promise<string>)> = {
	cpu: "Performance Core Clock",
	gpu: "Chipset",
	moba: "Form Factor",
	memory: async (page) => (await getTitle(page)).match(/\(\d x \d+ GB|MB/g)![0],
	storage: "Form Factor",
}

export const customSerializers: Partial<{
	[K in keyof PrismaModelMap]: Partial<Record<keyof PrismaModelMap[K], (value: string) => any>>
}> = {
	'storage': {
		capacity_gb: (value) => {
			const [n, unit] = value.split(' ')
			
			if (!n || !unit) return null

			const parsedN = parseFloat(n)

			if (unit === 'GB') return parsedN

			return parsedN * 1000
		},
		part_number: splitSpec,
	},
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
		memory_speed: (value): MemorySpeed[] => splitSpec(value).map(getMemorySpeed),
		m_2_slots: (value): MobaM2Slots[] => {
			const slots = splitSpec(value)
			return slots.map((slot) => ({
				id: '',
				size: slot.split(' ')[0].trim(),
				key_type: slot.split(' ')[1].replace("-key", "").trim() as M2Key
			}))
		}
	},
	'memory': {
		part_number: splitSpec,
		memory_speed: getMemorySpeed,
	}
	
}

export const mobaChipsetCustomSerializer: Record<string, Partial<Record<keyof Omit<MobaChipsetSpecs, 'name'>, (value: string) => any>>> = {
	intel: {
		usb_4_guaranteed: (value) =>  value.includes('4.0') ? false : null,
		pci_generation: (value) => Math.max(...value.trim().split(',').map(Number)),
		cpu_oc: (value) => value.includes('IA')
	}
}