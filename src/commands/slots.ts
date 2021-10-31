import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'

async function handler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<Message> {
    const slots = Array.from(guild.slots)

    const slotRecords = slots
        .sort(([a], [b]) => a - b)
        .map(
            ([slot, { name, value }]) =>
                `${slot}: [${name ?? shortString(value)}](${value})`
        )
        .join('\n')

    const slotsEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Slots')
        .setDescription(`${slotRecords || '***Empty***'}`)

    return await message.channel.send({ embeds: [slotsEmbed] })
}

export default {
    aliases: ['slots'],
    helpSort: 8,
    helpInfo: '`slots` show saved links',
    handler
}
