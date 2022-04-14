import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (guild.isPlaying) {
        return guild.stop()
    }

    return Promise.resolve()
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void | Message> {
    console.log(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing')

    interface ExecutorParams {
        changeIt: number
    }
    
async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand = {
    commandMessageNames: ['s'],
    sort: 4,
    helpInfo: '`s` stop playing and clear queue',
    slashConfig,
    messageHandler: handler
}

export default command
