import * as ClientCommands from './client-commands'

const commands: ClientCommand[] = Object.values(ClientCommands)
export const clientMessageCommands = commands.filter(
    (c): c is ClientCommand & { sort: number } => Number.isInteger(c.sort)
)

clientMessageCommands.sort((a, b) => a.sort - b.sort)
