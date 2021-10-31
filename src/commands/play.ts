import { Client, Message } from 'discord.js'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'

async function handler (
    this: Client,
    { message, guild, args }: CommadHandlerParams
): Promise<void | Message> {
    if (!message.member) return

    const [mode, ...query] = args

    if (message.member.voice.channel?.type !== 'GUILD_VOICE') {
        return await message.channel.send('You are not connected to a voice channel')
    }

    if (query.length === 0) {
        return await message.channel.send('What to play?')
    }

    try {
        const tracks = await issueTracks(query.join(' '), message.channel)

        if (mode === 'p') {
            return await guild.play(message.member.voice.channel, tracks)
        } else if (mode === 'fp') {
            return await guild.forcePlay(message.member.voice.channel, tracks)
        }
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.channel.send(error.message)
        } else {
            console.warn('playHandler', error)
            return await message.channel.send('It\'s hidden or something went wrong')
        }
    }
}

export default {
    aliases: ['p', 'fp'],
    sort: 11,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
