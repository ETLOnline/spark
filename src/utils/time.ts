export const MIN_DURATION_MINS = 30

/** Convert a "HH:mm" string to minutes since midnight. */
export function toMins(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}
