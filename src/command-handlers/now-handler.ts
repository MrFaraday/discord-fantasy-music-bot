import { Client, Message } from 'discord.js'

export default async function nowHandler (
    this: Client,
    { guild, message }: CommadHandlerParams
): Promise<void | boolean | Message> {
    const embed = guild.trackEmbed
    if (embed) {
        embed.setAuthor('Playing')
        return await message.channel.send({ embeds: [embed] })
    }
}
