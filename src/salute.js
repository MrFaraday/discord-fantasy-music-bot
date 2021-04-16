const { saluteEmbed } = require('./config')

/**
 * @param { import('discord.js').Guild } guild
 */
module.exports = async function onGuildCreate (guild) {
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    )

    return (
        (await tryToSaluteOnSystemChannel(guild)) ||
        (await tryToSaluteOnRandomChannel(guild)) ||
        (await tryToSaluteOwner(guild))
    )
}

/**
 * @param { import('discord.js').Guild } guild
 */
const tryToSaluteOnSystemChannel = async (guild) => {
    try {
        return await guild.systemChannel.send(saluteEmbed)
    } catch (error) {
        // fail
    }
}

/**
 * @param { import('discord.js').Guild } guild
 */
const tryToSaluteOnRandomChannel = async (guild) => {
    for (const guildChannel of guild.channels.cache) {
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

/**
 * @param { import('discord.js').Guild } guild
 */
const tryToSaluteOwner = async (guild) => {
    try {
        const owner = await guild.members.fetch(guild.ownerID)
        return await owner.send(saluteEmbed)
    } catch (error) {
        // fail
    }
}
