import Discord from 'discord.js'

// loading environment variables for development
if (process.env.NODE_ENV !== 'production')  require('dotenv').config()
const TOKEN = process.env.TOKEN
if (!TOKEN) throw new Error('Token not found. Check your bot.config.json, .env file or environment variables on your server')

const bot = new Discord.Client()

// Message dispatcher
bot.on('message', require('./messageDispatcher').default)

bot.on('ready', async () => {
  console.log(`\nBot ${bot.user.username} has lauched!`)
  const link = await bot.generateInvite([3147776])
  console.log('Link to invite bot to your guild:')
  console.log(link + '\n')
})

bot.login(TOKEN)
