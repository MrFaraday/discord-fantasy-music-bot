import { Client } from 'discord.js'

/**
 * Disconnect from current voice channel
 */
export default async function disconnectHandler (
    this: Client,
    { guild }: CommadHandlerParams
): Promise<void> {
    guild.disconnect()

    return Promise.resolve()
}
