declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production'
			GOOGLE_APPLICATION_CREDENTIALS: string
			DISCORD_TOKEN: string
			DONT_USE_THIS_HARDCODED_CHANNEL_ID?: string
		}
	}
}

export {}
