import { Client } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void> {
    guild.disconnect()

    return Promise.resolve()
}

const slashConfig = new SlashCommandBuilder().setName('disconnect')

export default {
    aliases: ['d'],
    sort: 7,
    helpInfo: '`d` disconnect from a voice channel',
    slashConfig,
    handler
}
