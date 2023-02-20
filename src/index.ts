import { Events } from 'discord.js'
import * as dotenv from 'dotenv'
import * as path from 'node:path'

import { discord } from './client/discord'

// load environment variables from .env.local in dir root
dotenv.config({
	path: path.join(__dirname, '..', '.env.local'),
})

function startUp(token: string) {
	console.log('Starting.')
	discord.login(token)
}

discord.once(Events.ClientReady, async (discord) => {
	console.info(`READY: I'm ${discord.user.tag} and ready to recognize text!`)
})

discord.on(Events.InteractionCreate, async (interaction) => {
	// right now we don't support any interaction types other than commands; guard return
	if (!interaction.isCommand())
		return void console.log(
			`Unsupported interaction type was received (${interaction.type})`
		)

	const command = discord.commands.get(interaction.commandName)

	if (!command)
		return void console.log(
			`Command ${interaction.commandName} is not registered`
		)

	try {
		await command.exec(interaction)
	} catch (err) {
		console.error(`Error while executing command ${command.meta.name}`, err)
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		})
	}
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
