import { Client } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'disconnect'

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
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName(interactionName)
    .setDescription('Disconect from current voice channel')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['d'],
    sort: 7,
    helpInfo: '`d` disconnect from a voice channel',
    messageHandler: handler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
