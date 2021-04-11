const youtubeApi = require('../api/youtube-api')
const list = require('../config/tracks.config.json')

class PlayError extends Error {}

/**
 * @type { MessageHandler }
 */
module.exports = async function playPreset ({ message, guild, args }) {
    if (args[1]) return
    if (!message.member.voice.channel) {
        return message.reply('I need you to connected to a voice channel')
    }

    const playlistUrl = issuePlaylist(args[0])
    const { listId } = youtubeApi.parseUrl(playlistUrl)

    try {
        const tracks = await youtubeApi.issueTracks(listId)

        if (tracks.length === 0) {
            throw new PlayError('It\'s empty')
        }

        await guild.forcePlay(message.member.voice.channel, tracks)
    } catch (error) {
        if (error instanceof PlayError) {
            return message.reply(error.message)
        } else {
            console.warn(error)
            return message.reply('It\'s hidden or something get wrong')
        }
    }
}

const issuePlaylist = (key) => {
    switch (key) {
        case '1':
            return list.peaceful
        case '2':
            return list.combat
        case '3':
            return list.dungeon
        case '4':
            return list.city
        case '5':
            return list.boss
        case '6':
            return list.mystery
        case '7':
            return list.tavern
        default:
            throw new Error('Wrong theme key.')
    }
}
