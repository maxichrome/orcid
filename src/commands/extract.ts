import {
	CommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
} from 'discord.js'
import * as path from 'node:path'

import { transcribeImageText } from '../lib/ocr'

const RESULT_PREVIEW_TRUNCATE_LIMIT = 140

export const meta = new SlashCommandBuilder()
	.setName('extract')
	.setDescription('Perform text recognition on a supplied source image.')
	// of course we need to take an iamge in lol
	.addAttachmentOption(
		new SlashCommandAttachmentOption()
			.setName('image')
			.setDescription('Image on which to perform text recognition')
			.setRequired(true)
	)
	// users should have send perms to use command
	.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	// command should be usable in DMs
	.setDMPermission(true)

export async function exec(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return

	const image = interaction.options.getAttachment('image', true)

	if (
		!image.contentType?.startsWith('image/') ||
		// exclude svg images
		image.contentType?.startsWith('image/svg')
	)
		throw new TypeError('NOTIMG')

	const before_transcription_timestamp = new Date()

	// TODO: need to account for errors from GCP api
	const transcription_result = await transcribeImageText(image.url)

	const after_transcription_timestamp = new Date()

	const time_spent_transcribing =
		after_transcription_timestamp.getTime() -
		before_transcription_timestamp.getTime()

	const result = {
		result: transcription_result,
		timeInMs: time_spent_transcribing,
	}

	const filename = path.basename(image.url)
	const resultB64 = new Buffer(result.result, 'base64').toString('base64url')

	interaction.reply({
		content: '',
		embeds: [
			typeof result.result === 'string'
				? new EmbedBuilder()
						.setColor(0x0000ee)
						.setTitle(filename)
						.setDescription(
							`\
${result.result
	.split('\n')
	.join(' ')
	.substring(0, RESULT_PREVIEW_TRUNCATE_LIMIT)}${
								result.result.length > RESULT_PREVIEW_TRUNCATE_LIMIT ? '…' : ''
							}

Click filename to view full result & easily copy/share.`
						)
						.setURL(
							`https://copy.maxichrome.dev/?title=${encodeURIComponent(
								filename
							)}#${resultB64}`
						)
						.setThumbnail(image.url)
						.setFooter({
							text: `Processed in ${result.timeInMs}ms`,
						})
				: new EmbedBuilder()
						.setColor(0xee0000)
						.setTitle(path.basename(image.url))
						.setDescription('🚫 No text found')
						.setThumbnail(image.url)
						.setFooter({
							text: `Processed in ${result.timeInMs}ms`,
						}),
		],
		allowedMentions: {
			repliedUser: false,
		},
	})
}
