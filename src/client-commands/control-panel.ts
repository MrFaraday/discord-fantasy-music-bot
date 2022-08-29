import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    Message
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'
import GuildSession from '../guild-session'

const interactionName = 'cpad'

const playbackControlButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('playback-cpad-stop')
        .setStyle(ButtonStyle.Danger)
        // .setLabel('\u23F9'),
        .setLabel('Stop'),
    /* new MessageButton()
        .setCustomId('playback-cpad-palypause')
        .setStyle('SUCCESS')
        .setLabel('\u25B6\u23F8')
        .setDisabled(true), */
    new ButtonBuilder()
        .setCustomId('playback-cpad-skip')
        .setStyle(ButtonStyle.Primary)
        // .setLabel('\u23ED')
        .setLabel('Skip')
)
const volumeControlButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('playback-cpad-reduce-volume-5')
        .setStyle(ButtonStyle.Secondary)
        // .setLabel('--🔊'),
        .setLabel('--Vol'),
    new ButtonBuilder()
        .setCustomId('playback-cpad-reduce-volume-1')
        .setStyle(ButtonStyle.Secondary)
        // .setLabel('-🔊'),
        .setLabel('-Vol'),
    new ButtonBuilder()
        .setCustomId('playback-cpad-increase-volume-1')
        .setStyle(ButtonStyle.Secondary)
        // .setLabel('+🔊'),
        .setLabel('+Vol'),
    new ButtonBuilder()
        .setCustomId('playback-cpad-increase-volume-5')
        .setStyle(ButtonStyle.Secondary)
        // .setLabel('++🔊')
        .setLabel('++Vol')
)

const groups = [[7, 8, 9], [4, 5, 6], [1, 2, 3], [0]]

const getBindFromKey =
    (key: number) =>
        ([bindKey]: [number, Bind]) =>
            bindKey === key

async function messageHandler (
    this: Client,
    { guild, message }: MessageCommadHandlerParams
): Promise<void | Message> {
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
        .setDescription(`${bindRecords || '***No binds***'}`)

    const bindsButtonRows = groups
        .filter((row) => row.some((key) => binds.find(getBindFromKey(key))))
        .map((row) => {
            return row.map((key) => {
                const bind = binds.find(getBindFromKey(key))

                const button = new ButtonBuilder()
                    .setCustomId('playback-cpad-bind-' + String(key))
                    .setLabel(String(key))
                    .setStyle(ButtonStyle.Secondary)

                if (!bind) {
                    button.setDisabled(true)
                }

                return button
            })
        })
        .map((buttons) => new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons))

    try {
        if (binds.length > 0) {
            await message.channel.send({
                embeds: [bindsEmbed],
                components: bindsButtonRows
            })
        }

        return await message.channel.send({
            content: `Volume: **${guild.volume}**`,
            components: [playbackControlButtonRow, volumeControlButtonRow]
        })
    } catch (error) {
        guild.journal.error(error)
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
    .setName(interactionName)
    .setDescription('Show control pad')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['cpad'],
    sort: 2,
    helpInfo: '`cpad` display control pad',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
