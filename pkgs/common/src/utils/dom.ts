export function downloadContent(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


export const listenWindowResize = (onResizeFinished: () => void) => {
  let timer: NodeJS.Timeout
  const resizeListener = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(onResizeFinished, 200)
  }
  window.addEventListener('resize', resizeListener)

  return () => {
    window.removeEventListener('resize', resizeListener)
  }
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
