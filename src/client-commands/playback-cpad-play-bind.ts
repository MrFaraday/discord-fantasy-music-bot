import { ButtonInteraction, ChannelType, Client, GuildMember } from 'discord.js'
import { BINDS_MAX_INDEX } from '../config'
import GuildSession from '../guild-session'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'
import { assert } from '../utils/assertion'

async function interactionHandler (
    this: Client,
    { interaction, guild }: InterationHandlerParams
): Promise<any> {
    if (!(interaction instanceof ButtonInteraction)) return

    try {
        if (!interaction.member || !(interaction.member instanceof GuildMember)) return
        if (interaction.member.voice.channel?.type !== ChannelType.GuildVoice) return

        const [key] = /\d+/.exec(interaction.customId) ?? []
        assert(key)

        const saved = guild.binds.get(Number(key))
        if (!saved) return

        const { tracks } = await issueTracks(guild.guildId, saved.value)

        void interaction.deferUpdate()

        return await guild.forcePlay(interaction.member.voice.channel, tracks)
    } catch (error) {
        void interaction.deferUpdate().catch(() => 0)

        if (error instanceof SourceError) {
            console.log(error)

            // await message.channel.send(error.message)
        } else {
            guild.journal.error(error)
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
    commandInteractionNames: new Array(BINDS_MAX_INDEX + 1)
        .fill(null)
        .map((_, i) => i)
        .map((key) => 'playback-cpad-bind-' + String(key)),
    interactionHandler,

    executor
}

export default command
