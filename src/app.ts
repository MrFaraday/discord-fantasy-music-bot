import Discord from 'discord.js'
import { TOKEN } from './config'

import commandDispatcher from './app-event-handlers/command-dispatcher'
import onGuildDelete from './app-event-handlers/on-guild-delete'
import onGuildCreate from './app-event-handlers/on-guild-create'

if (!TOKEN) {
    throw new Error('Environment variable TOKEN not found')
}

const app = new Discord.Client()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('message', commandDispatcher)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('guildCreate', onGuildCreate)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('guildDelete', onGuildDelete)

app.on('shardError', (error) => {
    console.error('A websocket connection encountered an error:', error)
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('ready', async () => {
    console.log(`\nBot ${app.user?.username ?? 'Unknown'} has lauched!`)
    const link = await app.generateInvite({
        permissions: [
            'ADD_REACTIONS',
            'SEND_MESSAGES',
            'SPEAK',
            'EMBED_LINKS',
            'ADD_REACTIONS',
            'CONNECT'
        ]
    })
    console.log('Link to invite bot to your guild:')
    console.log(link, '\n')
})

export async function fireApp (): Promise<void> {
    await app.login(TOKEN)
}
