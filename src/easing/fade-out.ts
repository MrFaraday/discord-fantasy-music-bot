// import { StreamDispatcher } from 'discord.js'
import { easeInExpo } from './ease-functions'

const fadeDuration = 1500
const interval = 20

export default function fadeOut (dispatcher: /* StreamDispatcher */ any): Promise<void> {
    return new Promise((resolve) => {
        // const leaveVolume = dispatcher.volume

        const reduce = (rest: number) => {
            if (rest < 0) {
                return resolve()
            }

            const next = rest - interval
            const factor = easeInExpo(next / fadeDuration)
            // dispatcher.setVolume(factor * leaveVolume)

            setTimeout(reduce, interval, next)
        }

        reduce(fadeDuration)
    })
}
