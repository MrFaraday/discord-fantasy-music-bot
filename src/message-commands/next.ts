import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.skip()
    }

    return Promise.resolve()
}

export default {
    aliases: ['n'],
    helpSort: 3,
    helpInfo: '`n` skip current track',
    handler
}
