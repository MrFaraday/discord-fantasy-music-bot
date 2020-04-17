import { Message } from 'discord.js'

import GuildConnection from './Classes/GuildConnection'  // Guild class
import { issuePlaylist } from './libs/issuePlaylist'  // Playlists issue service
import { Guilds } from './interfaces'

// loading environment variables for development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const PREFIX = process.env.PREFIX || ''

const guilds: Guilds = {}
export const messageDispatcher = async (message: Message) => {
  const args = message.content.substring(PREFIX.length).split(' ')

  switch (args[0]) {
    case 'hello': {
      message.reply('Hello :)')
      break
    }

    // Standard command to play track or add it to a queue
    case 'p':
    // Force play by url
    case 'fp': {
      if (!message.member.voice.channel) {
        message.reply('You are not connected to a voice channel...')
        break
      }

      if (!args[1]) {
        message.reply('What to play?')
      }

      if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = new GuildConnection(message.guild)
      }

      const guild = guilds[message.guild.id] 

      if (args[0] === 'p') {
        guild.play(message.member.voice.channel, args[1])
      } else if (args[0] === 'fp') {
        guild.forcePlay(message.member.voice.channel, [{
          name: 'Playing your video...',
          url: args[1]
        }])
      }

      break
    }

    // Play themes
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7': {
      if (args[1]) break
      if (!message.member.voice.channel) {
        message.reply('You are not connected to a voice channel...')
        break
      }

      if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = new GuildConnection(message.guild)
      }
      
      const guild = guilds[message.guild.id]
      guild.forcePlay(
        message.member.voice.channel,
        await issuePlaylist(args[0])
      )

      break
    }

    // Skip
    case 'n': {
      if (!guilds[message.guild.id]) {
        message.reply('I haven\'t played anything yet :(')
        break
      }

      const guild = guilds[message.guild.id] || new GuildConnection(message.guild)
      await guild.skip() || message.reply('Nothing to skip')  // if skip() returns 0 then reply

      break
    }

    // Stoping
    case 's': {
      if (!guilds[message.guild.id]) {
        message.reply('I haven\'t played anything yet :(')
        break
      }

      const guild = guilds[message.guild.id] || new GuildConnection(message.guild)
      await guild.stop() || message.reply('Nothing to stop')  // if stop() returns 0 then reply

      break
    }

    // Volume
    case 'v': {
      if (!args[1]) {
        message.reply('Set volume, 5 - default')
        break
      }

      if (!guilds[message.guild.id]) {
        message.reply('Halt! Who goes there!?')
        break
      }

      if (isNaN(Number(args[1]))) {
        message.reply('It\'s not a number, it must be rational number')
        break
      }

      const guild = guilds[message.guild.id]
      guild.volumeChange(parseInt(args[1], 10))

      break
    }

    default:
      break
  }
}

export default messageDispatcher
