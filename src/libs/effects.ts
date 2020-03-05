import { StreamDispatcher } from "discord.js"

// fadeOut
export const fadeOut = (dispatcher: StreamDispatcher) => {
  if (dispatcher.volume <= 0.001) {
    dispatcher.end()
    return
  }

  dispatcher.setVolume(dispatcher.volume * 0.95)
  setTimeout(fadeOut, 40, dispatcher)
}

export default {
  fadeOut
}
