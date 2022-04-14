import { Client } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): Promise<void> {
    guild.disconnect()

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
    .setName('disconnect')
    .setDescription('Disconect from current voice channel')

    interface ExecutorParams {
        changeIt: number
    }
    
async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand = {
    commandMessageNames: ['d'],
    sort: 7,
    helpInfo: '`d` disconnect from a voice channel',
    slashConfig,
    messageHandler: handler
}

export default command
