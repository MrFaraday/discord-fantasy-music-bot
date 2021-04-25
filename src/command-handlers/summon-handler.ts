import { Client, Message } from 'discord.js'

export default async function summonHandler (
    this: Client,
    { guild, message }: CommadHandlerParams
): Promise<void | boolean | Message> {
    if (!guild.channel) return

    const channel = message.member?.voice?.channel

    if (!channel) {
        return await message.channel.send('You are not connected to a voice channel')
    }

    if (channel.id !== guild.channel?.id) {
        return await guild.connect(channel)
    } else {
        return await message.channel.send('I\'m here')
    }
}
