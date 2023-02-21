import {
	Collection,
	Client as DiscordClient,
	GatewayIntentBits,
} from 'discord.js'

import * as extractCommand from '../commands/extract'

export const discord = (globalThis.__discordClient ??= new DiscordClient({
	intents: [GatewayIntentBits.Guilds],
}))

discord.commands = new Collection()
discord.commands.set('extract', extractCommand)
