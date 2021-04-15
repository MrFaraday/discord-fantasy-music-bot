const { saluteEmbed } = require('./config')
const { sleep } = require('./utils/timeout')

const isSaluteSent = {}

module.exports = function salute (app) {
    app.on('message', async function (message) {
        if (
            message.channel.type === 'text' &&
            message.type === 'GUILD_MEMBER_JOIN' &&
            message.author.id === this.user.id
        ) {
            try {
                await message.channel.send(saluteEmbed)
                isSaluteSent[message.guild.id] = true
            } catch (error) {
                // permissions or other error
            }
        }
    })

    app.on('guildCreate', async (guild) => {
        console.log(
            `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
        )

        try {
            await sleep(3000)

            if (!isSaluteSent[guild.id]) {
                const owner = await guild.members.fetch(guild.ownerID)
                await owner.send(saluteEmbed)
            } else {
                delete isSaluteSent[guild.id]
            }
        } catch (error) {
            // permissions or other
        }
    })
}
