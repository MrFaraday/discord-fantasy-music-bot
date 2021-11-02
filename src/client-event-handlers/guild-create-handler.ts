import { Client, Guild, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { isGuildText } from '../utils/channel'
import { concat } from '../utils/string'

export default async function onGuildCreate (this: Client, guild: Guild): Promise<void> {
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    )

    const sendInSystemChannel = await tryToSaluteOnSystemChannel(guild)

    if (!sendInSystemChannel) {
        await tryToSaluteOnRandomChannel(guild)
    }
}

const tryToSaluteOnSystemChannel = async (guild: Guild) => {
    try {
        if (guild.systemChannel) {
            await guild.systemChannel.send({ embeds: [saluteEmbed] })
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const tryToSaluteOnRandomChannel = async (guild: Guild) => {
    const channels = guild.channels.cache.filter(isGuildText)

    for (const guildChannel of [...channels.values()]) {
        try {
            await guildChannel.send({ embeds: [saluteEmbed] })
            return true
        } catch (error) {
            // wrong channel -> next
        }
    }

    return false
}

const saluteEmbed = new MessageEmbed()
    .setColor(EMBED_COLOR)
    .setTitle('Hello and thanks for adding me!')
    .setDescription(
        concat([
            'Now you can call me to play music at any time!',
            'Join a voice channel and type `-p [link]` to play a song or playlist from YouTube.',
            '',
            'Type `-help` or `-help v` to discover commands.',
            'If you have questions or suggestions follow to [Support Server](https://discord.gg/a68EqssbfT).'
        ])
    )
