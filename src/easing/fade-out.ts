import { AudioPlayer, AudioResource } from '@discordjs/voice'
import { easeInExpo } from './ease-functions'

const fadeDuration = 1500
const interval = 20

export default async function fadeOut (
    audioPlayer: AudioPlayer,
    resource: AudioResource
): Promise<void> {
    return new Promise((resolve) => {
        if (!resource.volume) {
            audioPlayer.stop(true)
            return resolve()
        }

        const leaveVolume = resource.volume?.volume

        const reduce = (rest: number) => {
            if (rest < 0) {
                audioPlayer.stop(true)
                return resolve()
            }

            const next = rest - interval
            const factor = easeInExpo(next / fadeDuration)

            resource.volume?.setVolume(factor * leaveVolume)

            setTimeout(reduce, interval, next)
        }

        reduce(fadeDuration)
    })
}
