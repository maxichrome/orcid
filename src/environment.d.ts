declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production'
			GOOGLE_APPLICATION_CREDENTIALS: string
			DISCORD_TOKEN: string
			DISCORD_CLIENT_ID: string
		}
	}
}

export {}
