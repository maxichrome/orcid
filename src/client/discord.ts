import { Client as DiscordClient } from 'discord.js'

export const discord = (globalThis.__discordClient ??= new DiscordClient({
	intents: ['Guilds', 'GuildMessages', 'MessageContent'],
}))
