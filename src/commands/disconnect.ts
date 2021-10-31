import { Client } from 'discord.js'

async function handler (this: Client, { guild }: CommadHandlerParams): Promise<void> {
    guild.disconnect()

    return Promise.resolve()
}

export default {
    aliases: ['d'],
    sort: 11,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
