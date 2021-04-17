/*
 * Ease functions for volume transitions
 */

export const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2)

export const easeInQuart = (x: number): number => x * x * x * x

export const easeInExpo = (x: number): number => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))
