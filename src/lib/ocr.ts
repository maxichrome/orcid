import { imageAnnotator } from '../client/gcp'

export async function transcribeImageText(url: string): Promise<string | null> {
	const [result] = await imageAnnotator.textDetection(url)

	return result.fullTextAnnotation?.text ?? null
}
