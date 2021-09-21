import { TextChannel, ThreadChannel } from 'discord.js'
import { GuildChannel } from 'discord.js'

export const isGuildText = (channel: GuildChannel | ThreadChannel): channel is TextChannel => {
    return channel.type === 'GUILD_TEXT'
}
