const youtubeApi = require('../api/youtube-api')

class PlayError extends Error {}

/**
 * @type { MessageHandler }
 */
module.exports = async function playPreset ({ message, guild, args }) {
    const slot = Number(args[0])

    if (args[1]) return
    if (!message.member.voice.channel) {
        return message.reply('I need you to connected to a voice channel')
    }

    const saved = guild.slots.get(slot)

    if (!saved) return

    const urlData = youtubeApi.parseUrl(saved.value)

    /**
     * @type { Track[] }
     */
    let tracks = []

    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId)
        tracks = [track]
    } else if (urlData.listId) {
        try {
            tracks = await youtubeApi.issueTracks(urlData.listId)

            if (tracks.length === 0) {
                throw new PlayError('It\'s empty')
            }
        } catch (error) {
            if (error instanceof PlayError) {
                return message.reply(error.message)
            } else {
                return message.reply('It\'s hidden or something get wrong')
            }
        }
    } else {
        return message.reply('I can\'t resolve link or something else...')
    }

    try {
        await guild.forcePlay(message.member.voice.channel, tracks)
    } catch (error) {
        console.error(error)
        message.reply('I can\'t resolve link or something else...')
    }
}
