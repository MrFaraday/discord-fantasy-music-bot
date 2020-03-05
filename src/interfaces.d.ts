import GuildConnection from './Classes/GuildConnection'

export interface Guilds {
  [key: string]: GuildConnection
}

export interface Track {
  name: string
  url: string
}
