import { Client } from 'discord.js'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void> {
    guild.disconnect()

    return Promise.resolve()
}

export default {
    aliases: ['d'],
    sort: 7,
    helpInfo: '`d` disconnect from a voice channel',
    handler
}
