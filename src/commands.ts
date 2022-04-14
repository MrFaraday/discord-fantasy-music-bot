import * as ClientCommands from './client-commands'

const commands: Command<any>[] = Object.values(ClientCommands)

export const messageCommands = commands.filter(
    (c): c is MessageCommand<any> => 'messageHandler' in c
)
messageCommands.sort((a, b) => a.sort - b.sort)

export const slashCommands = commands.filter(
    (c): c is SlashCommand<any> => 'slashConfig' in c
)

export const interactionCommands = commands.filter(
    (c): c is InteractionCommand<any> => 'interactionHandler' in c
)
