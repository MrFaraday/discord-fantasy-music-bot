import { Client, Message } from 'discord.js'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'

export default async function playSlotHandler (
    this: Client,
    { message, guild, args }: CommadHandlerParams
): Promise<Message | void> {
    const slot = Number(args[0])

    if (args[1]) return
    if (!message.member) return

    const saved = guild.slots.get(slot)
    if (!saved) return

    if (!message.member.voice.channel) {
        return await message.channel.send('I need you to connected to a voice channel')
    }

    try {
        const tracks = await issueTracks(saved.value)
        return await guild.forcePlay(message.member.voice.channel, tracks)
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.channel.send(error.message)
        } else {
            return await message.channel.send('It\'s hidden or something get wrong')
        }
    }
}
