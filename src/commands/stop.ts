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
    helpSort: 4,
    helpInfo: '`s` stop playing and clear queue',
    handler
}
