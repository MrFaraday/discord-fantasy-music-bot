import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import MessageCommand from '../message-command'

async function handler (
    this: Client,
    { guild, message }: MessageCommadHandlerParams
): Promise<void | boolean | Message> {
    const channel = message.member?.voice?.channel

    if (channel?.type !== 'GUILD_VOICE') {
        return await message.channel.send('You are not connected to a voice channel')
    }

    if (channel.id !== message.guild?.me?.voice.channel?.id) {
        return await guild.connect(channel)
    } else {
        return await message.channel.send('I\'m here')
    }
}

const slashConfig = new SlashCommandBuilder().setName('summon')

export default new MessageCommand({
    aliases: ['summon'],
    sort: 11,
    helpInfo: '`summon` attract bot to your voice channel while playing or idle',
    slashConfig,
    handler
})
