import dotenv from 'dotenv'

// loading environment variables for development

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { config }: typeof dotenv = require('dotenv')
config()

export const TOKEN = process.env.TOKEN
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
export const DATABASE_URL = process.env.DATABASE_URL

export const EMBED_COLOR = '#f26d53'
export const MAX_QUEUE_LENGTH = 50

export const DEFAULT_PREFIX = '-'
export const DEFAULT_VOLUME = 100
