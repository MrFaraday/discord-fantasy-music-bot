// Playlists
import list from '../config/tracks.config.json'

export const  issuePlaylist = async (key: string) => {
  switch (key) {
    case '1':
      return list.peaceful
    case '2':
      return list.combat
    case '3':
      return list.dungeon
    case '4':
      return list.city
    case '5':
      return list.boss
    case '6':
      return list.mystery
    case '7':
      return list.tavern
    default:
      throw new Error ('Wrong theme key.')
  }
}

export default issuePlaylist
