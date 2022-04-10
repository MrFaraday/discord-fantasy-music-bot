import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// import ClientCommand from '../client-command'

async function handler (
    this: Client,
    { message }: MessageCommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}

const slashConfig = new SlashCommandBuilder().setName('hello')

const command: ClientCommand = {
    aliases: ['hello'],
    sort: 11,
    slashConfig,
    handler
} 

export default command
