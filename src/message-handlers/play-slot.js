const issueTracks = require('../issue-tracks')
const SourceError = require('../source-error')

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

    try {
        const tracks = await issueTracks(saved.value)
        return await guild.forcePlay(message.member.voice.channel, tracks)
    } catch (error) {
        if (error instanceof SourceError) {
            return message.reply(error.message)
        } else {
            return message.reply('It\'s hidden or something get wrong')
        }
    }
}
