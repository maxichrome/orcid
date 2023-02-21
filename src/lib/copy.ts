export const generateCopyUrl = (
	content: string,
	title?: string,
	encoding: BufferEncoding = 'utf8'
) => {
	const contentBase64 = Buffer.from(content, encoding).toString('base64url')

	let params: URLSearchParams = new URLSearchParams()

	if (title) {
		params.set('title', encodeURIComponent(title))
	}

	return `https://copy.maxichrome.vercel.app/${
		params.values.length > 0 ? '?' + params.toString() : ''
	}#${contentBase64}`
}
