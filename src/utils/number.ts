export const isValidInteger = (num: number, from: number, to: number): boolean => {
    return !Number.isNaN(num) && Number.isInteger(num) && num >= from && num <= to
}
