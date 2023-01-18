import * as dotenv from 'dotenv'
import * as path from 'node:path'

import { discord } from './client/discord'
import { transcribeImageText } from './lib/ocr'

// load environment variables from .env.local in dir root
dotenv.config({
	path: path.join(__dirname, '..', '.env.local'),
})

function startUp(token: string) {
	console.log('Starting.')
	discord.login(token)
}

discord.once('ready', (discord) => {
	console.info(`READY: I'm ${discord.user.tag} and ready to recognize text!`)
})

discord.on('messageCreate', async (msg) => {
	if (msg.author.bot) return
	if (msg.attachments.size < 1) return

	let processing_promises: Promise<string>[]
	let typing_interval: ReturnType<typeof setInterval>

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

	typing_interval = setInterval(() => {
		msg.channel
			.sendTyping()
			.catch((err) =>
				console.log(`NO-TYP: Typing event not sent due to error\n${err}`)
			)
	}, 3000)

	processing_promises = image_attachments.map((attachment) =>
		// TODO: need to account for errors from GCP api
		transcribeImageText(attachment.url)
	)

	let ocr_results = await Promise.all(processing_promises)
	ocr_results = ocr_results.filter(
		(result) => typeof result === 'string' && result.length > 0
	)

	// we have our results! stop "typing"
	clearInterval(typing_interval)

	if (ocr_results.length < 1) {
		msg.reply({
			content: 'No text was found',
			allowedMentions: {
				repliedUser: false,
			},
		})
		return
	}

	// TODO: need to account for splitting at >2000 characters
	msg.reply({
		content: `\
Text found:\n\
\n\
${ocr_results.join('\n\n')}`,
		allowedMentions: {
			repliedUser: false,
		},
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
