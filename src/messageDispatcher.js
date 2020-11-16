const { Message } = require('discord.js')
const ytlist = require('youtube-playlist')

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

            // If link leads to playlist
            let playList
            try {
                const { data } = await ytlist(link, 'url')
                playList = data.playlist
                if (playList.length === 0) {
                    message.reply("It's empty... Or They're just hidden from me.")
                    return
                }
            } catch (err) {
                // not playlist
            }

            try {
                if (mode === 'p' && !playList) {
                    await guild.play(message.member.voice.channel, link)
                } else if (mode === 'fp' || playList) {
                    await guild.forcePlay(
                        message.member.voice.channel,
                        playList
                            ? playList.map((url) => ({
                                  url
                              }))
                            : [{ url: link }]
                    )
                }
            } catch (error) {
                console.error(error)
                message.reply("I can't resolve link or something worse...")
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

            const playlistLink = issuePlaylist(args[0])

            const res = await ytlist(playlistLink, 'url')
            console.log(res)
            const playlist = res.data.playlist.map((url) => ({
                url
            }))

            try {
                await guild.forcePlay(message.member.voice.channel, playlist)
            } catch (error) {
                if (error.message === 'empty') {
                    message.reply("Wow, It's empty...")
                }
            }

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
