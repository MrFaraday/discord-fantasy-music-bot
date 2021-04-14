const issueTracks = require('../issue-tracks')
const SourceError = require('../source-error')

/**
 * @type { MessageHandler }
 */
module.exports = async function playPreset ({ message, guild, args }) {
    const slot = Number(args[0])

    if (args[1]) return

    const saved = guild.slots.get(slot)
    if (!saved) return

    if (!message.member.voice.channel) {
        return await message.reply('I need you to connected to a voice channel')
    }

    try {
        const tracks = await issueTracks(saved.value)
        return await guild.forcePlay(message.member.voice.channel, tracks)
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.reply(error.message)
        } else {
            return await message.reply('It\'s hidden or something get wrong')
        }
    }
}
