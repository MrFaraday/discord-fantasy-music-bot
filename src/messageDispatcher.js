const { Message } = require('discord.js')

const GuildConnection = require('./Classes/GuildConnection') // Guild class
const issuePlaylist = require('./libs/issuePlaylist') // Playlists issue service

// loading environment variables for development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const PREFIX = process.env.PREFIX || ''

/**
 * @type { Object.<string, GuildConnection> }
 */
const guilds = {}

/**
 * Dispatcher
 * @param { Message } message
 */
const messageDispatcher = async (message) => {
    const { id: guildId } = message.guild
    const args = message.content.substring(PREFIX.length).split(' ')

    if (!guilds[guildId]) {
        guilds[guildId] = new GuildConnection(message.guild)
    }

    const guild = guilds[guildId]

    switch (args[0]) {
        case 'hello': {
            message.reply('Hello :)')
            break
        }

        // Standard command to play track or add it to a queue
        case 'p':
        // Force play by url
        case 'fp': {
            const [mode, link] = args

            if (!message.member.voice.channel) {
                message.reply('You are not connected to a voice channel...')
                break
            }
            if (!link) {
                message.reply('What to play?')
            }

            if (mode === 'p') {
                guild.play(message.member.voice.channel, link)
            } else if (mode === 'fp') {
                guild.forcePlay(message.member.voice.channel, [
                    {
                        name: 'Playing your video...',
                        url: link
                    }
                ])
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

            guild.forcePlay(message.member.voice.channel, await issuePlaylist(args[0]))

            break
        }

        // Next song
        case 'n': {
            if (!guilds[message.guild.id]) {
                message.reply("I haven't played anything yet :(")
                break
            }

            if (guild.isPlaying()) {
                guild.skip()
            } else {
                message.reply('Nothing to skip')
            }

            break
        }

        // Stoping
        case 's': {
            if (!guilds[message.guild.id]) {
                message.reply("I haven't played anything yet :(")
                break
            }

            if (guild.isPlaying()) {
                guild.stop()
            } else {
                message.reply('Nothing to stop')
            }

            break
        }

        // Volume
        case 'v': {
            const [_mode, volume] = args
            if (!volume) {
                message.reply('Set volume, 5 - default')
                break
            }
            if (isNaN(Number(volume))) {
                message.reply("It's not a number, it must be rational number")
                break
            }

            guild.volumeChange(parseInt(volume, 10))

            break
        }

        default:
            break
    }
}

module.exports = messageDispatcher
