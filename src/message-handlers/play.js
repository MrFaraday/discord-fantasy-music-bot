const youtubeApi = require('../api/youtube-api')
const ytdl = require('ytdl-core-discord')

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

    let playList

    const urlData = youtubeApi.parseUrl(link)
    if (urlData.videoId) {
        const url = youtubeApi.buildPlayLink(urlData.videoId)

        playList = [
            {
                name: await youtubeApi.getVideoTitle(urlData.videoId),
                getStream: () => ytdl(url),
                meta: [['url', url]]
            }
        ]
    } else if (urlData.listId) {
        try {
            const listContent = await youtubeApi.getListContent(urlData.listId)

            playList = listContent.map(({ title, videoId }) => {
                const url = youtubeApi.buildPlayLink(videoId)

                return {
                    name: title,
                    getStream: () => ytdl(url),
                    meta: [['url', url]]
                }
            })

            if (playList.length === 0) throw new Error('List is empty')
        } catch (error) {
            return message.reply('It\'s empty or just hidden from me')
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
