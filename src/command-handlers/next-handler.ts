import { Client, Message } from 'discord.js'

export default async function nextHandler (
    this: Client,
    { guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.skip()
    }

    return Promise.resolve()
}
