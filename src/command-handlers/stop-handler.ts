import { Client, Message } from 'discord.js'

export default async function stopHandler (
    this: Client,
    { guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.stop()
    }

    return Promise.resolve()
}
