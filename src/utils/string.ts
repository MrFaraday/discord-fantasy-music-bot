export const shortString = (str: string, maxLength = 40): string => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3).padEnd(maxLength, '.')
    } else {
        return str
    }
}
