import { Client } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

interface MessageCommadParams {
    aliases: string[]
    sort?: number
    helpInfo?: string
    slashConfig: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    handler(this: Client, { guild, message }: MessageCommadHandlerParams): Promise<any>
}

export default class MessageCommand {
    constructor (params: MessageCommadParams) {
        Object.assign(this, params)
    }
}
