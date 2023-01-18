import { annotator } from './lib/gcp'

export async function transcribeImageText(url: string): Promise<string> {
	const [result] = await annotator.textDetection(url)
	console.log(JSON.stringify(result.fullTextAnnotation))

	return result.fullTextAnnotation?.text ?? null
}
