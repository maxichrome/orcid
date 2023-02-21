import { generateCopyUrl } from './lib/copy'

const RESULT_PREVIEW_TRUNCATE_LIMIT = 140
export const resultBody = (result: string) => {
	const copyUrl = generateCopyUrl(result)
	const singleLineResult = result.split('\n').join(' ')

	const isTruncated = singleLineResult.length > RESULT_PREVIEW_TRUNCATE_LIMIT
	const displayResult = isTruncated
		? `${singleLineResult.substring(0, RESULT_PREVIEW_TRUNCATE_LIMIT)} …`
		: singleLineResult

	return `\
${displayResult}

[${isTruncated ? 'Show more' : 'View raw'}](${copyUrl})`
}
