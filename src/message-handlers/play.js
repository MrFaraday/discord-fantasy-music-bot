const youtubeApi = require('../api/youtube-api')

class PlayError extends Error {}

/**
 * @type { MessageHandler }
 */
module.exports = async function play ({ message, guild, args }) {
    const [mode, link] = args

    if (!message.member.voice.channel) {
        return message.reply('You are not connected to a voice channel...')
    } else if (!link) {
        return message.reply('What to play?')
    }

    /**
     * @type { Track[] }
     */
    let playList

    const urlData = youtubeApi.parseUrl(link)
    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId)
        playList = [track]
    } else if (urlData.listId) {
        try {
            const tracks = await youtubeApi.issueTracks(urlData.listId)

            if (tracks.length === 0) {
                throw new PlayError('It\'s empty')
            }

            playList = tracks
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
        if (mode === 'p') {
            await guild.play(message.member.voice.channel, playList)
        } else if (mode === 'fp') {
            await guild.forcePlay(message.member.voice.channel, playList)
        }
    } catch (error) {
        console.error(error)
        message.reply('I can\'t resolve link or something else...')
    }
}
