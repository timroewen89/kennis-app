// Inhoud van buiten is niet te vertrouwen: alleen gewone https-links doorlaten.
export function safeUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
