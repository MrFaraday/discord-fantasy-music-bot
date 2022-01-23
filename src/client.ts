import Discord, { Intents, Permissions } from 'discord.js'
import { TOKEN } from './config'

import messageCreateHandler from './client-event-handlers/message-create-handler'
import guildDeleteHandler from './client-event-handlers/guild-delete-handler'
import guildCreateHandler from './client-event-handlers/guild-create-handler'
import interactionCreateHandler from './client-event-handlers/interaction-create-handler'
import { assert } from './utils/assertion'

assert(TOKEN, 'Environment variable TOKEN not found')

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

client.on('messageCreate', messageCreateHandler)
client.on('interactionCreate', interactionCreateHandler)
client.on('guildCreate', guildCreateHandler)
client.on('guildDelete', guildDeleteHandler)

client.on('shardError', (error) => {
    console.error('A websocket connection encountered an error:', error)
})

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
