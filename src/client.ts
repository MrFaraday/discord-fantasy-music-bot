import Discord, { Intents, Permissions } from 'discord.js'
import { TOKEN } from './config'

import commandDispatcher from './client-event-handlers/command-dispatcher'
import onGuildDelete from './client-event-handlers/on-guild-delete'
import onGuildCreate from './client-event-handlers/on-guild-create'

if (!TOKEN) {
    throw new Error('Environment variable TOKEN not found')
}

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] })

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('messageCreate', commandDispatcher)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('guildCreate', onGuildCreate)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('guildDelete', onGuildDelete)

client.on('shardError', (error) => {
    console.error('A websocket connection encountered an error:', error)
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('ready', () => {
    console.log(`\nBot ${client.user?.username ?? 'Unknown'} has lauched!`)
    const link = client.generateInvite({
        scopes: ['bot'],
        permissions: [
            Permissions.FLAGS.ADD_REACTIONS,
            Permissions.FLAGS.SEND_MESSAGES,
            Permissions.FLAGS.SPEAK,
            Permissions.FLAGS.EMBED_LINKS,
            Permissions.FLAGS.CONNECT
        ]
    })
    console.log('Link to invite bot to your guild:')
    console.log(link, '\n')
})

export async function fireClient (): Promise<void> {
    await client.login(TOKEN)
}
