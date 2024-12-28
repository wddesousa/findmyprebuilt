import { PrismaModelMap } from "./types"

const SERIALIZED_VALUES: Record<string, any> = {
	none: null,
	yes: true,
	no: false,
}

const DECIMAL_REGEX = /\d*\.?\d*/g

export const genericSerialize = (value: string, extractNumber = false) => {
	if (extractNumber) return serializeNumber(value)

	const lower = value.toLowerCase()
	const serialized = SERIALIZED_VALUES[lower]

	return typeof serialized === 'undefined' ? value : serialized
}

export const serializeNumber = (value: string) => {
	const numbers = value.match(DECIMAL_REGEX)
	if (!numbers) return null

	const matches = numbers.filter((n) => n !== '')
	if (!matches.length) return null

	return matches.length === 1
		? parseFloat(matches[0]!)
		: matches.map((n) => parseFloat(n))
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
		part_number: (value) => {
			return value.split("\n").filter(l => l.trim() !== "").map(l => l.trim())
		},
	}
}