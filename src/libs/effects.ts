import { StreamDispatcher } from 'discord.js'

// fadeOut
export const fadeOut = (dispatcher: StreamDispatcher) => {
  if (dispatcher.volume < 0.00001) {
    dispatcher.end()
    return
  }

  dispatcher.setVolume(dispatcher.volume * 0.97)
  setTimeout(fadeOut, 10, dispatcher)
}

export default {
  fadeOut
}
