// loading environment variables for development

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { config }: typeof import('dotenv') = require('dotenv')
config()

export const NODE_ENV = process.env.NODE_ENV
export const TOKEN = process.env.TOKEN
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
export const DATABASE_URL = process.env.DATABASE_URL
export const TEST_SERVER_ID = process.env.TEST_SERVER_ID

export const EMBED_COLOR = '#f26d53'
export const QUEUE_MAX_LENGTH = 50

export const DEFAULT_PREFIX = '-'
export const DEFAULT_VOLUME = 100
