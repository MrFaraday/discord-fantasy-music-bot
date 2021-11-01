import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild, message }: CommadHandlerParams
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

export default {
    aliases: ['summon'],
    helpSort: 11,
    helpInfo: '`summon` attract bot to your voice channel while playing or idle',
    handler
}
