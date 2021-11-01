import { Client, Message, MessageActionRow, MessageButton } from 'discord.js'

async function handler (
    this: Client,
    { guild, message }: CommadHandlerParams
): Promise<void | Message> {
    const row1 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('7').setLabel('7').setStyle('SECONDARY'),
        new MessageButton().setCustomId('8').setLabel('8').setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('9')
            .setLabel('9')
            .setStyle('SECONDARY')
            .setDisabled(true)
    )
    const row2 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('4').setLabel('4').setStyle('SECONDARY'),
        new MessageButton().setCustomId('5').setLabel('5').setStyle('SECONDARY'),
        new MessageButton().setCustomId('6').setLabel('6').setStyle('SECONDARY')
    )
    const row3 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('1').setLabel('1').setStyle('SECONDARY'),
        new MessageButton().setCustomId('2').setLabel('2').setStyle('SECONDARY'),
        new MessageButton().setCustomId('3').setLabel('3').setStyle('SECONDARY')
    )
    const row4 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('0').setLabel('0').setStyle('SECONDARY'),
        // new MessageButton().setCustomId('PLUG').setLabel(' ').setStyle('SECONDARY').setDisabled(true),
        new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY')
    )

    try {
        await message.channel.send({
            content: 'kk',
            components: [row1, row2, row3, row4]
        })
    } catch (error) {
        console.warn(error)
    }

    return Promise.resolve()
}

export default {
    aliases: ['cpanel'],
    helpSort: 5,
    helpInfo: '`cpanel` --',
    handler
}
