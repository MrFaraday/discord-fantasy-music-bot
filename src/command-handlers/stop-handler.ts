import { Client, Message } from 'discord.js'

export default async function stopHandler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying()) {
        return guild.stop()
    } else {
        return await message.channel.send('Nothing to stop')
    }
}
