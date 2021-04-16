const issueTracks = require('../issue-tracks')
const SourceError = require('../source-error')

/**
 * @type { MessageHandler }
 */
module.exports = async function play ({ message, guild, args }) {
    const [mode, link] = args

    if (!message.member.voice.channel) {
        return await message.reply('You are not connected to a voice channel...')
    } else if (!link) {
        return await message.reply('What to play?')
    }

    try {
        const tracks = await issueTracks(link)

        if (mode === 'p') {
            return await guild.play(message.member.voice.channel, tracks)
        } else if (mode === 'fp') {
            return await guild.forcePlay(message.member.voice.channel, tracks)
        }
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.reply(error.message)
        } else {
            return await message.reply('It\'s hidden or something get wrong')
        }
    }
}
