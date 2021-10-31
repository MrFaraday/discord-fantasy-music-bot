import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.stop()
    }

    return Promise.resolve()
}

export default {
    aliases: ['s'],
    sort: 11,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
