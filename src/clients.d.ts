import type { ImageAnnotatorClient } from '@google-cloud/vision'
import type { Client as DiscordClient } from 'discord.js'

declare global {
	var __discordClient: DiscordClient
	var __visionImageAnnotatorClient: ImageAnnotatorClient
}
