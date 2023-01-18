import { ImageAnnotatorClient } from '@google-cloud/vision'

namespace globalThis {
	export let __visionImageAnnotatorClient: ImageAnnotatorClient | undefined
}

export const annotator = (globalThis.__visionImageAnnotatorClient ??=
	new ImageAnnotatorClient())
