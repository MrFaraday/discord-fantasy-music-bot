import { TextChannel } from 'discord.js'
import { GuildChannel } from 'discord.js'

export const isGuildText = (channel: GuildChannel): channel is TextChannel => {
    return channel.isText() && channel.type === 'text'
}
