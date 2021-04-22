import { Client, Guild, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { concat } from '../utils/string'

export default async function onGuildCreate (
    this: Client,
    guild: Guild
): Promise<boolean> {
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    )

    return (
        (await tryToSaluteOnSystemChannel(guild)) ||
        (await tryToSaluteOnRandomChannel(guild)) ||
        (await tryToSaluteOwner(guild))
    )
}

const tryToSaluteOnSystemChannel = async (guild: Guild) => {
    try {
        if (guild.systemChannel) {
            await guild.systemChannel.send(saluteEmbed)
            return true
        }

        return false
    } catch (error) {
        return false
    }
}

const tryToSaluteOnRandomChannel = async (guild: Guild) => {
    const channels = guild.channels.cache.array()

    for (const guildChannel of channels) {
        if (guildChannel.type === 'text' && guildChannel.isText()) {
            try {
                await guildChannel.send(saluteEmbed)
                return true
            } catch (error) {
                // wrong channel -> next
            }
        }
    }

    return false
}

const tryToSaluteOwner = async (guild: Guild) => {
    try {
        const owner = await guild.members.fetch(guild.ownerID)
        await owner.send(saluteEmbed)
        return true
    } catch (error) {
        return false
    }
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
