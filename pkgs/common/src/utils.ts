export function getBaseUrl(url: string) {
  const urlObj = new URL(url)
  urlObj.pathname = "";
  urlObj.search = "";
  urlObj.hash = "";
  return urlObj.href
}

export function getAbsUrl(url: string|undefined, baseUrl: string) {
  if (!url) return ''
  // do not convert anchors
  if (url.startsWith('#')) return url
  if (url.match(/^https?:\/\//)) {
    // is absolute url already
    return url
  }
  // some media urls use // as the start, but this could still be handled by URL
  return new URL(url, baseUrl).href
}

export function getSelectionHTML(): string {
  let html = ''
  const sel = window.getSelection()
  if (sel && sel.rangeCount) {
    const container = document.createElement('div')
    for (let i = 0, len = sel.rangeCount; i < len; ++i) {
      container.appendChild(sel.getRangeAt(i).cloneContents())
    }
    html = container.innerHTML
  }
  return html
}
