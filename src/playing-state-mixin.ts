export enum PlaybackState {
    IDLE = 0,
    PLAYING = 1,
    STOPPING = 2,
    LODAING = 3
}

export default class PlayingStateMixin {
    private _state: PlaybackState = PlaybackState.IDLE
    private stateEnterListeners: { state: PlaybackState; callback: () => void }[] = []

    get state (): PlaybackState {
        return this._state
    }

    set state (state: PlaybackState) {
        this._state = state

        console.log('Playing state changed to: ', state)

        const forResolve = this.stateEnterListeners.filter((l) => l.state === state)
        this.stateEnterListeners = this.stateEnterListeners.filter(
            (l) => l.state !== state
        )

        forResolve.forEach((l) => l.callback())
    }

    public entersState (state: PlaybackState, timeout = 5000): Promise<void> {
        if (this.state === state) {
            return Promise.resolve(void 0)
        }

        return new Promise((resolve, reject) => {
            setTimeout(reject, timeout)
            this.stateEnterListeners.push({ state, callback: () => resolve(void 0) })
        })
    }
}
