import { EmbedBuilder } from 'discord.js'
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

	// hardcoded channel id if we are masochists
	if (
		process.env.DONT_USE_THIS_HARDCODED_CHANNEL_ID &&
		msg.channelId !== process.env.DONT_USE_THIS_HARDCODED_CHANNEL_ID
	)
		return

	let processing_promises: Promise<{
		result: string | null
		timeInMs: number
	}>[]
	let typing_interval: ReturnType<typeof setInterval>

	const image_attachments = msg.attachments.filter(
		(attachment) =>
			attachment.contentType?.startsWith('image/') &&
			// exclude svg images
			!attachment.contentType?.startsWith('image/svg')
	)

	if (image_attachments.size < 1) {
		console.log(
			`NO-IMG: Ignoring message; has attachments, none are image files. (id=${msg.id})`
		)
		return
	}

	// until i figure out why it always comes back with nothing we just say byebye to this kinda request
	if (image_attachments.size > 1) {
		msg.reply(`
⛔️  **I can't handle more than one image at a time.**
This could change in the future, but for now take it easy on me and only use a single image per message.\
`)
		return
	}

	typing_interval = setInterval(() => {
		msg.channel
			.sendTyping()
			.catch((err) =>
				console.log(`NO-TYP: Typing event not sent due to error\n${err}`)
			)
	}, 3000)

	processing_promises = image_attachments.map(async (attachment) => {
		const before_transcription_timestamp = new Date()

		// TODO: need to account for errors from GCP api
		const transcription_result = await transcribeImageText(attachment.url)

		const after_transcription_timestamp = new Date()

		const time_spent_transcribing =
			after_transcription_timestamp.getTime() -
			before_transcription_timestamp.getTime()

		return {
			result: transcription_result,
			timeInMs: time_spent_transcribing,
		}
	})

	let ocr_results_original = await Promise.all(processing_promises)

	// we have our results! stop "typing"
	clearInterval(typing_interval)

	msg.reply({
		content: ocr_results_original.map(({ result }) => result).join('\n\n'),
		embeds: ocr_results_original.map(({ result, timeInMs }, index) => {
			let attachment = image_attachments.at(index)
			const hasResult = typeof result === 'string'

			return new EmbedBuilder()
				.setColor(hasResult ? 0x0000ee : 0xee0000)
				.setTitle(path.basename(attachment.url))
				.setDescription(
					hasResult ? '✅ Processed successfully' : '🚫 No text found'
				)
				.setThumbnail(attachment.proxyURL ?? attachment.url)
				.setFooter({
					text: `Processed in ${timeInMs}ms`,
				})
		}),
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
