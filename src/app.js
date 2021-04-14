const Discord = require('discord.js')
const { TOKEN } = require('./config')
const db = require('./db')

if (!TOKEN) {
    throw new Error('Token not found. Check your .env file or environment variables on your server')
}

const app = new Discord.Client()

// Message dispatcher
app.on('message', require('./message-dispatcher'))

app.on('guildCreate', async (guild) => {
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    )

    if (!guild.available) return

    try {
        const owner = await guild.members.fetch(guild.ownerID)
        owner.send('Thanks! You can use *help* to discover commands.')
    } catch (error) {
        console.error('Can\'t send greetings to owner')
        console.error(error)
    }
})

app.on('guildDelete', async (guild) => {
    const client = await db.getClient()

    try {
        await client.query(
            'DELETE FROM slot WHERE guild_id IN (SELECT id FROM guild) AND guild_id = $1',
            [String(guild.id)]
        )
        await client.query('DELETE FROM guild WHERE id = $1', [String(guild.id)])
    } catch (error) {
        console.error('Error on guildDelete')
        console.error(error)
    } finally {
        client.release()
    }
})

app.on('ready', async () => {
    console.log(`\nBot ${app.user.username} has lauched!`)
    const link = await app.generateInvite({
        permissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SPEAK', 'ADD_REACTIONS', 'CONNECT']
    })
    console.log('Link to invite bot to your guild:')
    console.log(link, '\n')
})

module.exports.fireApp = async function () {
    await app.login(TOKEN)
    return app
}
