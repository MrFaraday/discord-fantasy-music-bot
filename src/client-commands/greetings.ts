import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// import ClientCommand from '../client-command'

async function handler (
    this: Client,
    { message }: MessageCommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void | Message> {
    console.log(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder().setName('hello').setDescription('Hello!')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand = {
    commandMessageNames: ['hello'],
    sort: 11,
    slashConfig,
    messageHandler: handler
}

export default command
