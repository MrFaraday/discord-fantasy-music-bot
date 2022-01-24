import {
    Client,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'
import MessageCommand from '../message-command'

const playbackControlButtonRow = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('playback-cpad-stop')
        .setStyle('DANGER')
        // .setLabel('\u23F9'),
        .setLabel('Stop'),
    /* new MessageButton()
        .setCustomId('playback-cpad-palypause')
        .setStyle('SUCCESS')
        .setLabel('\u25B6\u23F8')
        .setDisabled(true), */
    new MessageButton()
        .setCustomId('playback-cpad-skip')
        .setStyle('PRIMARY')
        // .setLabel('\u23ED')
        .setLabel('Skip')
)
const volumeControlButtonRow = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('playback-cpad-reduce-volume-5')
        .setStyle('SECONDARY')
        // .setLabel('--🔊'),
        .setLabel('--Vol'),
    new MessageButton()
        .setCustomId('playback-cpad-reduce-volume-1')
        .setStyle('SECONDARY')
        // .setLabel('-🔊'),
        .setLabel('-Vol'),
    new MessageButton()
        .setCustomId('playback-cpad-increase-volume-1')
        .setStyle('SECONDARY')
        // .setLabel('+🔊'),
        .setLabel('+Vol'),
    new MessageButton()
        .setCustomId('playback-cpad-increase-volume-5')
        .setStyle('SECONDARY')
        // .setLabel('++🔊')
        .setLabel('++Vol')
)

const groups = [[7, 8, 9], [4, 5, 6], [1, 2, 3], [0]]

const getBindFromKey =
    (key: number) =>
        ([bindKey]: [number, Bind]) =>
            bindKey === key

async function handler (
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

    const bindsEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setDescription(`${bindRecords || '***No binds***'}`)

    const bindsButtonRows = groups
        .filter((row) => row.some((key) => binds.find(getBindFromKey(key))))
        .map((row) => {
            return row.map((key) => {
                const bind = binds.find(getBindFromKey(key))

                const button = new MessageButton()
                    .setCustomId('playback-cpad-bind-' + String(key))
                    .setLabel(String(key))
                    .setStyle('SECONDARY')

                if (!bind) {
                    button.setDisabled(true)
                }

                return button
            })
        })
        .map((buttons) => new MessageActionRow().addComponents(...buttons))

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
        console.warn(error)
    }
}

const slashConfig = new SlashCommandBuilder().setName('cpad')

export default new MessageCommand({
    aliases: ['cpad'],
    sort: 2,
    helpInfo: '`cpad` display control pad',
    slashConfig,
    handler
})
