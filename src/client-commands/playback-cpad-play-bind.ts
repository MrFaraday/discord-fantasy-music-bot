import { ButtonInteraction, Client, GuildMember } from 'discord.js'
import GuildSession from '../guild-session'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'
import { assert } from '../utils/assertion'

async function interactionHandler (
    this: Client,
    { interaction, guild }: InterationHandlerParams
): Promise<any> {
    if (!(interaction instanceof ButtonInteraction)) return
    if (!interaction.member || !(interaction.member instanceof GuildMember)) return
    if (interaction.member.voice.channel?.type !== 'GUILD_VOICE') return

    const [key] = /\d/.exec(interaction.customId) ?? []
    assert(key)

    const saved = guild.binds.get(Number(key))
    if (!saved) return

    try {
        const { tracks } = await issueTracks(saved.value)

        void interaction.deferUpdate()

        return await guild.forcePlay(interaction.member.voice.channel, tracks)
    } catch (error) {
        void interaction.deferUpdate().catch(() => 0)

        if (error instanceof SourceError) {
            // await message.channel.send(error.message)
        } else {
            console.warn(error)
            // await message.channel.send("It's hidden or something went wrong")
        }
    }
}

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: InteractionCommand<ExecutorParams> = {
    commandInteractionNames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        (key) => 'playback-cpad-bind-' + String(key)
    ),
    interactionHandler,

    executor
}

export default command
