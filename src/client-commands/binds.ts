import {
    Client,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message,
    TextBasedChannel,
    TextChannel
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'
import GuildSession from '../guild-session'
import assert from 'assert'

const interactionName = 'binds'

async function messageHandler (
    this: Client,
    { message, guild }: MessageCommadHandlerParams
): Promise<any> {
    const reply = executor(guild, { channel: message.channel })
    return await message.channel.send(reply)
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<any> {
    if (!interaction.isCommand()) return
    assert(interaction.channel)

    // await interaction.deferReply()
    // await interaction.editReply('Pong!');

    const reply = executor(guild, { channel: interaction.channel })
    await interaction.reply(reply)
}

const slashConfig = new SlashCommandBuilder()
    .setName(interactionName)
    .setDescription('Show binds')

interface ExecutorParams {
    channel: TextBasedChannel
}

function executor (guild: GuildSession, { channel }: ExecutorParams) {
    const binds = Array.from(guild.binds)

    const bindRecords = binds
        .sort(([a], [b]) => a - b)
        .map(
            ([bindKey, { name, value }]) =>
                `**${bindKey}** [${name ?? shortString(value)}](${value})`
        )
        .join('\n')

    const bindsEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('Binds')
        .setDescription(`${bindRecords || '***Empty***'}`)

    return { embeds: [bindsEmbed] }
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
