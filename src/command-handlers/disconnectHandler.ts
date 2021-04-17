/**
 * Disconnect from current voice channel
 */
export default function disconnectHandler ({ guild }: CommadHandlerParams): void {
    guild.disconnect()
}
