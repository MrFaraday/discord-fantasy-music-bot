import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild }: CommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.skip()
    }

    return Promise.resolve()
}

export default {
    aliases: ['n'],
    sort: 11,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
