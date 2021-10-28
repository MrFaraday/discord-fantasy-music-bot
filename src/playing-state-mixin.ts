export enum PlayingState {
    IDLE,
    PENDING,
    PLAYING
}

export default class PlayingStateMixin {
    private _state: PlayingState = PlayingState.IDLE
    private stateEnterListeners: { state: PlayingState; callback: () => void }[] = []

    get state (): PlayingState {
        return this._state
    }

    set state (state: PlayingState) {
        this._state = state

        console.log('Playing state changed to: ', state)

        const forResolve = this.stateEnterListeners.filter((l) => l.state === state)
        this.stateEnterListeners = this.stateEnterListeners.filter(
            (l) => l.state !== state
        )

        forResolve.forEach((l) => l.callback())
    }

    public entersState (state: PlayingState, timeout = 5000): Promise<void> {
        if (this.state === state) {
            return Promise.resolve(void 0)
        }

        return new Promise((resolve, reject) => {
            setTimeout(reject, timeout)
            this.stateEnterListeners.push({ state, callback: () => resolve(void 0) })
        })
    }
}
