export function getBaseUrl(url: string) {
  const urlObj = new URL(url)
  urlObj.pathname = "";
  urlObj.search = "";
  urlObj.hash = "";
  return urlObj.href
}

export function getAbsUrl(url: string|undefined, baseUrl: string) {
  if (!url) return ''
  if (url.match(/^https?:\/\//)) {
    // is absolute url already
    return url
  }
  // some media urls use // as the start, but this could still be handled by URL
  return new URL(url, baseUrl).href
}
