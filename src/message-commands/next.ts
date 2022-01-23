import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.skip()
    }

    return Promise.resolve()
}

const slashConfig = new SlashCommandBuilder().setName('next')

export default {
    aliases: ['n'],
    sort: 3,
    helpInfo: '`n` skip current track',
    slashConfig,
    handler
}
