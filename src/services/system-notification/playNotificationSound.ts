let lastPlayedAt = 0

let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null

  if (!audio) {
    audio = new Audio("/notification/notification.mp3")
    audio.preload = "auto"
    audio.volume = 1.0
  }
  return audio
}

export function playNotificationSound() {
  const sound = getAudio()
  if (!sound) {
    console.warn("🔇 Audio API not available in this environment")
    return
  }

  const now = Date.now()
  const cooldown = 2000

  if (now - lastPlayedAt < cooldown) {
    return
  }

  try {
    sound.currentTime = 0
    sound
      .play()
      .then(() => {
        lastPlayedAt = now
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          console.warn("🔇 Autoplay blocked until user interaction")
        } else {
          console.error("❌ Failed to play notification sound:", err)
        }
      })
  } catch (err) {
    console.error("❌ Unexpected error playing notification sound:", err)
  }
}
