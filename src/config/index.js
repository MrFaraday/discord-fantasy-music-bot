// loading environment variables for development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

module.exports.TOKEN = process.env.TOKEN
module.exports.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
module.exports.DATABASE_URL = process.env.DATABASE_URL
