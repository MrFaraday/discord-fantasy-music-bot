const { StreamDispatcher } = require('discord.js')

const easeInSine = (x) => 1 - Math.cos((x * PI) / 2)

/**
 * @param { StreamDispatcher } dispatcher
 */
const fadeOut = (dispatcher) => {
    const fadeDuration = 2500
    const currVolume = dispatcher.volume

    if (dispatcher.volume < 0.00001) {
        dispatcher.end()
        return
    }

    dispatcher.setVolume(dispatcher.volume * 0.97)
    setTimeout(fadeOut, 10, dispatcher)
}

module.exports = {
    fadeOut
}
