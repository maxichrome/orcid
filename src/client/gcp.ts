import { ImageAnnotatorClient } from '@google-cloud/vision'

export const imageAnnotator = (globalThis.__visionImageAnnotatorClient ??=
	new ImageAnnotatorClient())
