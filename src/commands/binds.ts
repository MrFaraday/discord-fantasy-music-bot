import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'

async function handler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<Message> {
    const binds = Array.from(guild.binds)

    const bindRecords = binds
        .sort(([a], [b]) => a - b)
        .map(
            ([bindKey, { name, value }]) =>
                `${bindKey}: [${name ?? shortString(value)}](${value})`
        )
        .join('\n')

    const bindsEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Binds')
        .setDescription(`${bindRecords || '***Empty***'}`)

    return await message.channel.send({ embeds: [bindsEmbed] })
}

export default {
    aliases: ['binds'],
    helpSort: 8,
    helpInfo: '`binds` show saved links',
    handler
}
