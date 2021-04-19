import { Client, Message } from 'discord.js'

export default async function nextHandler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying()) {
        return guild.skip()
    } else {
        return await message.channel.send('Nothing to skip')
    }
}
