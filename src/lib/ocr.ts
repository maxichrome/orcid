import { imageAnnotator } from '../client/gcp'

export async function transcribeImageText(url: string): Promise<string | null> {
	const [result] = await imageAnnotator.textDetection(url)
	console.log(JSON.stringify(result.fullTextAnnotation))

	return result.fullTextAnnotation?.text ?? null
}
