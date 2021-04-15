const { MessageEmbed } = require('discord.js')

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

module.exports.saluteEmbed = new MessageEmbed()
    .setColor(this.EMBED_COLOR)
    .setTitle('Hello and thanks for adding me!')
    .setDescription(
        'Now you can call me to play music anytime.\
     Join a voice channel and type `p [link]` to play any song or playlist from YouTube!\n\
     \n\
     Type `help` to discover commands.\n\
     If you have questions or suggestions open issue [here](https://github.com/mr-faraday/discord-fantasy-music-bot/issues).'
    )
