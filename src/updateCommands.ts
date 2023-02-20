import { REST, Routes } from 'discord.js'
import * as dotenv from 'dotenv'
import * as path from 'node:path'

import { commands as commandList } from './commands'

// load environment variables from .env.local in dir root
dotenv.config({
	path: path.join(__dirname, '..', '.env.local'),
})

const clientId = process.env.DISCORD_CLIENT_ID,
	token = process.env.DISCORD_TOKEN

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token)

// and deploy your commands!
;(async () => {
	try {
		const commands = commandList.map((cmd) => cmd.meta.toJSON())

		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		})

		if (!Array.isArray(data))
			return void console.log(
				`Successfully reloaded commands, but data returned was not an array. Wtf?`
			)

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		)
	} catch (error) {
		console.error(error)
	}
})()
