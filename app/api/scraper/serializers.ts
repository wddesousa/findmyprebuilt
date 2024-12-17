const SERIALIZED_VALUES: Record<string, any> = {
	none: null,
	yes: true,
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