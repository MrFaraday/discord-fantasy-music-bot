import {
    Client,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from 'discord.js'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'

const playbackControlButtonRow = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('playback-cpanel-stop')
        .setStyle('DANGER')
        .setLabel('\u23F9'),
    /* new MessageButton()
        .setCustomId('playback-cpanel-palypause')
        .setStyle('SUCCESS')
        .setLabel('\u25B6\u23F8')
        .setDisabled(true), */
    new MessageButton()
        .setCustomId('playback-cpanel-skip')
        .setStyle('PRIMARY')
        .setLabel('\u23ED'),
    new MessageButton()
        .setCustomId('playback-cpanel-reduce-volume')
        .setStyle('SECONDARY')
        .setLabel('-🔊'),
    new MessageButton()
        .setCustomId('playback-cpanel-increase-volume')
        .setStyle('SECONDARY')
        .setLabel('+🔊')
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
                    .setCustomId('playback-cpanel-bind-' + String(key))
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
        return await message.channel.send({
            embeds: [bindsEmbed],
            components: [...bindsButtonRows, playbackControlButtonRow]
        })
    } catch (error) {
        console.warn(error)
    }
}

export default {
    aliases: ['cpanel'],
    helpSort: 5,
    helpInfo: '`cpanel` --',
    handler
}
