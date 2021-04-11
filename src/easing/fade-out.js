const { easeInExpo } = require('./ease-functions')

const fadeDuration = 2500
const interval = 20

/**
 * @param { import('discord.js').StreamDispatcher } dispatcher
 */
module.exports = function fadeOut (dispatcher) {
    const leaveVolume = dispatcher.volume

    const reduce = (rest) => {
        if (rest < 0) {
            dispatcher.end()
            return
        }

        const next = rest - interval
        const factor = easeInExpo(next / fadeDuration)
        dispatcher.setVolume(factor * leaveVolume)

        setTimeout(reduce, interval, next)
    }

    reduce(fadeDuration)
}
