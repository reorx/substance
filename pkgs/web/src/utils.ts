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
