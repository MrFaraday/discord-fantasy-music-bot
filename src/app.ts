import Discord from 'discord.js'

import messageDispatcher from './messageDispatcher'

/* Configuration:
 * cfg.prefix - Prefix for commands in text channels
 * cfg.token - Token, take it on development portal
 */
import cfg from "./config/bot.config.json"
process.env.NODE_ENV === 'production' || require('dotenv').config()  // for development
const TOKEN = process.env.TOKEN || cfg.token

if (!TOKEN) throw new Error('No token. Check your bot.config.json, .env file or environment variables on server')

const bot = new Discord.Client()

// Message dispatcher
messageDispatcher(bot)

bot.on("ready", async () => {
  console.log(`\nBot ${bot.user.username} have lauched!`)
  const link = await bot.generateInvite([3147776])
  console.log("Link to invite bot to server:")
  console.log(link + '\n')
})

bot.login(TOKEN)
