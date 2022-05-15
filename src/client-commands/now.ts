import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'now'

async function messageHandler (
    this: Client,
    { guild, message }: MessageCommadHandlerParams
): Promise<void | boolean | Message> {
    const embed = guild.trackEmbed
    if (embed) {
        embed.setAuthor({ name: 'Playing' })
        return await message.channel.send({ embeds: [embed] })
    }
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('now')
    .setDescription('Show current track')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['now'],
    sort: 6,
    helpInfo: '`now` display current playing track',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
