import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import youtubeApi from '../api/youtube-api'
import db from '../db'
import { isValidInteger } from '../utils/number'
import { shortString } from '../utils/string'
import GuildSession from '../guild-session'

const interactionName = 'bind'

const urlRegEx =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/

async function messageHandler (
    this: Client,
    { guild, args, message }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const [, bindParam, url] = args

    const bindName = args.slice(3).join(' ')
    const bindKey = Number(bindParam)

    if (!bindParam) {
        return await message.channel.send('No params provided')
    } else if (!isValidInteger(bindKey, 0, 15)) {
        return await message.channel.send('Bind key must be an integer from 0 to 15')
    } else if (!url) {
        return await message.channel.send('No link provided')
    } else if (url.length > 500) {
        return await message.channel.send('Link is too long, maximum 500 of characters')
    } else if (!urlRegEx.test(url)) {
        return await message.channel.send('It\'s not a link, maybe')
    } else if (!(await youtubeApi.isSourceExist(url))) {
        return await message.channel.send(
            'Sorry, I followed a link and have found nothing'
        )
    } else if (bindName.length > 80) {
        return await message.channel.send('Name is too long, maximum 80 of characters')
    }

    try {
        await executor(guild, { bindKey, url, bindName })

        const messageText = bindName ? 'Saved!' : 'Saved! You can also add a name to it.'
        return await message.channel.send(messageText)
    } catch (error) {
        return await message.channel.send('Something went wrong, I\'ll find that soon.')
    }
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    if (!interaction.isCommand()) return

    await interaction.deferReply()

    console.debug(interaction.options.get('number'))
    console.debug(interaction.options.get('link'))

    await interaction.editReply({ content: 'ok' })
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName(interactionName)
    .setDescription('Bind play link!')
    .addIntegerOption((option) =>
        option
            .setName('number')
            .setDescription('Lala')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(15)
    )
    .addStringOption((option) =>
        option.setName('link').setDescription('Link url').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('name').setDescription('Bind name').setRequired(false)
    )

interface ExecutorParams {
    bindKey: number
    url: string
    bindName?: string
}

async function executor (guild: GuildSession, { bindKey, url, bindName }: ExecutorParams) {
    const client = await db.getClient()

    try {
        const [record] = (
            await client.query(
                `
                SELECT bind_key FROM bind
                WHERE guild_id = $1 AND bind_key = $2
                `,
                [guild.guildId, bindKey]
            )
        ).rows

        if (record) {
            await client.query(
                `
                UPDATE bind SET bind_key = $2, bind_value = $3, bind_name = $4
                WHERE guild_id = $1 AND bind_key = $2
                `,
                [guild.guildId, bindKey, url, bindName || null]
            )
        } else {
            await client.query(
                `
                INSERT INTO bind (guild_id, bind_key, bind_value, bind_name)
                VALUES ($1, $2, $3, $4)
                `,
                [guild.guildId, bindKey, url, bindName || null]
            )
        }

        guild.binds.set(bindKey, { name: bindName || shortString(url), value: url })
    } catch (error) {
        guild.journal.error(error)
        throw error
    } finally {
        client.release()
    }
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['bind'],
    sort: 9,
    helpInfo:
        '`bind [0..15] [link] [name?]` bind link to number, rest of input will be name but it optional',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
