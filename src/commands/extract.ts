import {
	CommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
} from 'discord.js'
import * as path from 'node:path'

import { transcribeImageText } from '../lib/ocr'
import { resultBody } from '../messages'

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

	const timestampPreTranscription = new Date()

	// TODO: need to account for errors from GCP api
	const ocrResult = await transcribeImageText(image.url)

	const timestampPostTranscription = new Date()

	const ocrMillisecondsSpent =
		timestampPostTranscription.getTime() - timestampPreTranscription.getTime()

	const filename = path.basename(image.url)

	interaction.reply({
		content: '',
		embeds: [
			typeof ocrResult === 'string'
				? new EmbedBuilder()
						.setColor(0x0000ee)
						.setTitle(filename)
						.setDescription(resultBody(ocrResult))
						.setThumbnail(image.url)
						.setFooter({
							text: `Processed in ${ocrMillisecondsSpent}ms`,
						})
				: new EmbedBuilder()
						.setColor(0xee0000)
						.setTitle(path.basename(image.url))
						.setDescription('🚫 No text found')
						.setThumbnail(image.url)
						.setFooter({
							text: `Processed in ${ocrMillisecondsSpent}ms`,
						}),
		],
		allowedMentions: {
			repliedUser: false,
		},
	})
}
