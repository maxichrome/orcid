import { Client, Collection } from 'discord.js'

import { CommandData } from './commands'

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, CommandData>
	}
}
