import { Client, Message, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'
import ClientCommand from '../client-command'

async function handler (
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

const slashConfig = new SlashCommandBuilder().setName('binds')

export default new ClientCommand({
    aliases: ['binds'],
    sort: 8,
    helpInfo: '`binds` show saved links',
    slashConfig,
    handler
})
