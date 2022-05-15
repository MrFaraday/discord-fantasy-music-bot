import { Client, Message, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'
import GuildSession from '../guild-session'

const interactionName = 'binds'

async function messageHandler (
    this: Client,
    { message, guild }: MessageCommadHandlerParams
): Promise<Message> {
    const binds = Array.from(guild.binds)

    const bindRecords = binds
        .sort(([a], [b]) => a - b)
        .map(
            ([bindKey, { name, value }]) =>
                `**${bindKey}** [${name ?? shortString(value)}](${value})`
        )
        .join('\n')

    const bindsEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Binds')
        .setDescription(`${bindRecords || '***Empty***'}`)

    return await message.channel.send({ embeds: [bindsEmbed] })
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
    .setDescription('Show binds')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['binds'],
    sort: 8,
    helpInfo: '`binds` show saved links',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
