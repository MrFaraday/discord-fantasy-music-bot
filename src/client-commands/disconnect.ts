import { Client } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'disconnect'

function messageHandler (
    this: Client,
    { guild }: MessageCommadHandlerParams
): any {
    executor(guild)
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


function executor (guild: GuildSession) {
    guild.disconnect()
}

const command: MessageCommand & SlashCommand = {
    commandMessageNames: ['d'],
    sort: 7,
    helpInfo: '`d` disconnect from a voice channel',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
