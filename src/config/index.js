// loading environment variables for development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

module.exports = {
    TOKEN: process.env.TOKEN,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,

    EMBED_COLOR: '#f26d53'
}
