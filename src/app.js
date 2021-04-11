const Discord = require('discord.js')
const { TOKEN } = require('./config')

if (!TOKEN) {
    throw new Error('Token not found. Check your .env file or environment variables on your server')
}

const bot = new Discord.Client()

// Message dispatcher
bot.on('message', require('./message-dispatcher'))

bot.on('ready', async () => {
    console.log(`\nBot ${bot.user.username} has lauched!`)
    const link = await bot.generateInvite({
        permissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SPEAK']
    })
    console.log('Link to invite bot to your guild:')
    console.log(link, '\n')
})

bot.login(TOKEN)
