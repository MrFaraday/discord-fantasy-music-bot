import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { shortString } from '../utils/string'

export default async function slotsHandler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<Message> {
    const slots = Array.from(guild.slots)

    const slotRecords = slots
        .map(
            ([slot, { name, value }]) =>
                `${slot}: [${name ?? shortString(value)}](${value})`
        )
        .join('\n')

    const slotsEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Slots')
        .setDescription(`${slotRecords || '***Empty***'}`)

    return await message.channel.send(slotsEmbed)
}
