export function assert (value: unknown, message?: string): asserts value {
    if (!value) {
        throw new AssertionError(message ?? 'No message')
    }
}

export function assertType<T> (
    value: unknown,
    exp: boolean,
    message?: string
): asserts value is T {
    if (!exp) {
        throw new AssertionError(message ?? 'No message')
    }
}

class AssertionError extends Error {
    constructor (message: string) {
        super(message)
        Object.setPrototypeOf(this, AssertionError.prototype)
    }
}
