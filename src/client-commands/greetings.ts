import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

const interactionName = 'hello'

async function messageHandler (
    this: Client,
    { message }: MessageCommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}

async function interactionHandler (
    this: Client,
    { interaction }: InterationHandlerParams
): Promise<void> {
    if (interaction.isCommand()) {
        await interaction.reply('Hello :)')
    }
}

const slashConfig = new SlashCommandBuilder()
    .setName(interactionName)
    .setDescription('Hello!')

const command: MessageCommand<void> & SlashCommand<void> = {
    commandMessageNames: ['hello'],
    sort: 11,
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler
}

export default command
