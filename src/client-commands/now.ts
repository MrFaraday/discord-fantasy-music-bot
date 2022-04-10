import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { guild, message }: MessageCommadHandlerParams
): Promise<void | boolean | Message> {
    const embed = guild.trackEmbed
    if (embed) {
        embed.setAuthor('Playing')
        return await message.channel.send({ embeds: [embed] })
    }
}

const slashConfig = new SlashCommandBuilder()
    .setName('now')
    .setDescription('Show current track')

const command: ClientCommand = {
    aliases: ['now'],
    sort: 6,
    helpInfo: '`now` display current playing track',
    slashConfig,
    handler
}

export default command
