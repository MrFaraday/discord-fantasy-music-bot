import { Client, Guild, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'

export default async function onGuildCreate (this: Client, guild: Guild): Promise<void> {
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    )

    void (await tryToSaluteOnSystemChannel(guild)) ||
        (await tryToSaluteOnRandomChannel(guild)) ||
        (await tryToSaluteOwner(guild))
}

const tryToSaluteOnSystemChannel = async (guild: Guild) => {
    try {
        if (guild.systemChannel) {
            return await guild.systemChannel.send(saluteEmbed)
        }
    } catch (error) {
        // fail
    }
}

const tryToSaluteOnRandomChannel = async (guild: Guild) => {
    try {
        return guild.channels.cache.find
    } catch (error) {
        // fail
    }

    const channels = guild.channels.cache.keys()
    for (const guildChannel of channels) {
        const [, channel] = guildChannel
        if (channel.type === 'text' && channel.isText()) {
            try {
                return await channel.send(saluteEmbed)
            } catch (error) {
                // fail
            }
        }
    }
}

const tryToSaluteOwner = async (guild: Guild) => {
    try {
        const owner = await guild.members.fetch(guild.ownerID)
        return await owner.send(saluteEmbed)
    } catch (error) {
        // fail
    }
}

const saluteEmbed = new MessageEmbed()
    .setColor(EMBED_COLOR)
    .setTitle('Hello and thanks for adding me!')
    .setDescription(
        'Now you can call me to play music anytime.\
         Join a voice channel and type `p [link]` to play any song or playlist from YouTube!\n\
         \n\
         Type `help` to discover commands.\n\
         If you have questions or suggestions open issue [here](https://github.com/mr-faraday/discord-fantasy-music-bot/issues).'
    )
