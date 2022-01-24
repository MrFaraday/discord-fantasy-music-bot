import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import MessageCommand from '../message-command'

async function handler (
    this: Client,
    { message }: MessageCommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}

const slashConfig = new SlashCommandBuilder().setName('hello')

export default new MessageCommand({
    aliases: ['hello'],
    sort: 11,
    slashConfig,
    handler
})
