export const isValidInteger = (num: number, from: number, to: number): boolean => {
    return !Number.isNaN(num) && Number.isInteger(num) && num >= from && num <= to
}

export const clamp = (num: number, min: number, max: number): number => {
    if (num < min) return min
    if (num > max) return max
    return num
}
