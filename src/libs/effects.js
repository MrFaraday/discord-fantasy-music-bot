const { StreamDispatcher } = require('discord.js')

/**
 * fadeOut
 * @param { StreamDispatcher } dispatcher
 */
const fadeOut = (dispatcher) => {
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
