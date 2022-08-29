import Discord, { GatewayIntentBits, OAuth2Scopes, PermissionFlagsBits } from 'discord.js'
import { TOKEN } from './config'

import messageCreateHandler from './client-event-handlers/message-create-handler'
import guildDeleteHandler from './client-event-handlers/guild-delete-handler'
import guildCreateHandler from './client-event-handlers/guild-create-handler'
import interactionCreateHandler from './client-event-handlers/interaction-create-handler'
import { assert } from './utils/assertion'
import { concatMessages, LogLevel } from './journal'

assert(TOKEN, 'Environment variable TOKEN not found')

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.on('messageCreate', messageCreateHandler)
client.on('interactionCreate', interactionCreateHandler)
client.on('guildCreate', guildCreateHandler)
client.on('guildDelete', guildDeleteHandler)

client.on('shardError', (error) => {
    console.log(
        concatMessages(
            `${LogLevel.ERROR} The bot will now attempt to reconnect to the gateway\n`,
            error
        )
    )
})

client.on('ready', () => {
    console.log(`\nBot ${client.user?.username ?? 'Unknown'} has lauched!`)
    const link = client.generateInvite({
        scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        permissions: [
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.Connect
        ]
    })
    console.log('Link to invite bot to your guild:')
    console.log(link, '\n')
})

export async function fireClient (): Promise<void> {
    await client.login(TOKEN)
}
