import * as dotenv from 'dotenv'
import * as path from 'node:path'

import { discord } from './client/discord'
import { transcribeImageText } from './lib/ocr'

// load environment variables from .env.local in dir root
dotenv.config({
	path: path.join(__dirname, '..', '.env.local'),
})

function startUp(token: string) {
	discord.login(token)
}

discord.once('ready', (discord) => {
	console.info(`READY: I'm ${discord.user.tag} and ready to recognize text!`)
})

discord.on('messageCreate', async (msg) => {
	let typing_promise: Promise<void>
	let processing_promises: Promise<string>[]
	let typing_interval: ReturnType<typeof setInterval>

	const makeTypingPromise = () =>
		// a promise that never resolves, always sends typing until stopped
		// we will plug this into a Promise.race later so do not worry ;)
		new Promise<void>((_, reject) => {
			typing_interval = setInterval(() => {
				msg.channel.sendTyping().catch(reject)
			}, 5000)
		})

	console.log(msg.attachments.map((a) => a.contentType).join('...'))

	const image_attachments = msg.attachments.filter(
		(attachment) =>
			attachment.contentType.startsWith('image/') &&
			// exclude svg images
			!attachment.contentType.startsWith('image/svg')
	)

	if (image_attachments.size < 1) {
		console.log(
			`NO-IMG: No images found in message. Ignoring it. (id=${msg.id})`
		)
		return
	}

	typing_promise = makeTypingPromise()
	processing_promises = image_attachments.map((attachment) =>
		// TODO: need to account for errors from GCP api
		transcribeImageText(attachment.url)
	)

	const ocr_results = await Promise.all(processing_promises)
	clearInterval(typing_interval)

	if (ocr_results.length <= 0) {
		msg.reply('No text was found')
		return
	}

	// TODO: need to account for splitting at >2000 characters
	msg.reply({
		content: `\
Text found:\n\
\n\
${ocr_results.join('\n\n')}`,
	})
})

function doGracefulExit(): void {
	console.log('Exiting gracefully.')

	discord.user.setStatus('invisible')
	discord.destroy()
}

// terminal ctrl-c
process.once('SIGINT', () => doGracefulExit())
// exited from elsewhere. we probably can't graceful exit from here but let's try
process.once('SIGTERM', () => doGracefulExit())

startUp(process.env.DISCORD_TOKEN)
