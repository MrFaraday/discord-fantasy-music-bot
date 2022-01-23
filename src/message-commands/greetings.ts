import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { message }: MessageCommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}

const slashConfig = new SlashCommandBuilder().setName('hello')

export default {
    aliases: ['hello'],
    sort: 11,
    slashConfig,
    handler
}
