// Ease functions
const easeOutSine = (x) => Math.sin((x * Math.PI) / 2)
const easeInQuart = (x) => x * x * x * x
const easeInExpo = (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))

module.exports = class Effects {
    state = 'awaiting'

    /**
     * @param { import('discord.js').StreamDispatcher } dispatcher
     */
    fadeOut(dispatcher) {
        if (this.state !== 'awaiting') {
            return
        }

        this.state = 'active'
        const fadeDuration = 2500
        const interval = 20
        const leaveVolume = dispatcher.volume

        const reduce = (rest) => {
            if (rest < 0) {
                dispatcher.end()
                this.state = 'awaiting'
                return
            }

            const next = rest - interval
            const factor = easeInExpo(next / fadeDuration)
            dispatcher.setVolume(factor * leaveVolume)

            setTimeout(reduce, interval, next)
        }

        reduce(fadeDuration)
    }
}
