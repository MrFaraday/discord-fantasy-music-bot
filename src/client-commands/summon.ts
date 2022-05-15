import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'summon'

async function messageHandler (
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

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('summon')
    .setDescription('Attract bot to your voice channel')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['summon'],
    sort: 11,
    helpInfo: '`summon` attract bot to your voice channel while playing or idle',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
