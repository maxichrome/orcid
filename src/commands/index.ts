import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import * as extractCommand from './extract'

export interface CommandData {
	meta: Partial<SlashCommandBuilder>
	exec(interaction: CommandInteraction): Promise<void>
}

export const commands: CommandData[] = [extractCommand]
