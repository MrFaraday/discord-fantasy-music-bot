import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'stop'

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
): Promise<void> {
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

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['s'],
    sort: 4,
    helpInfo: '`s` stop playing and clear queue',
    messageHandler: handler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
