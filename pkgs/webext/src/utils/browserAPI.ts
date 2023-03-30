import { MsgType } from 'src/consts';


export const getCurrentTab = async (): Promise<chrome.tabs.Tab | null> => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })
  if (tabs.length === 0) return null
  if (!tabs[0].id) return null
  return tabs[0]
}


function isInjected(name: string): boolean {
  const rv = ((window as any)._substanceInjectedScripts || {})[name] === true
  console.log('detecting injected script', name, rv)
  return rv
}

// https://developer.chrome.com/docs/extensions/mv3/content_scripts/#programmatic
export const injectScript = async (file: string, tabId: number): Promise<void> => {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: isInjected,
    args: [file],
  })
  if (results.length > 0 && results[0].result === true) {
    console.info(`${file} already injected, skip`)
    return
  }

  console.log('injecting', tabId, file)
  // NOTE if the injected script has dependency problems, like being handled by splitChunks and the dependency is missing,
  // executeScript would success, and the page would have no log and error message, makes it such a difficulty to debug
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [file],
  })
  console.log('injecting done', file)
}

export const injectScriptInTab = async (scriptPath: string, tab: chrome.tabs.Tab) => {
  await injectScript(scriptPath, tab.id as number)
}

export const openOrCreatePage = async (page: string, nextToCurrent: boolean = true): Promise<chrome.tabs.Tab> => {
  const url = chrome.runtime.getURL(page)
  const tabs = await chrome.tabs.query({
    url,
  })
  if (tabs.length > 0) {
    // switch to the tab
    return chrome.tabs.update(tabs[0].id!, {
      active: true,
    })!
  }
  let index
  if (nextToCurrent) {
    const currentTab = await getCurrentTab()
    if (currentTab) {
      index = currentTab.index + 1
    }
  }
  return chrome.tabs.create({
    url,
    ...(index !== undefined ? { index } : {}),
  })
}

export const ensurePageReady = async (page: string): Promise<chrome.tabs.Tab> => {
  const tab = await openOrCreatePage(page)
  // console.debug(`ensurePageReady: try to pin with ${page} ${tab.id}`)

  try {
    console.log('ensurePageReady: try send ping')
    const res = await chrome.tabs.sendMessage(tab.id as number, {
      type: MsgType.Ping,
    })
    if (!res.pong) {
      throw new Error('ensurePageReady: did not receive pong')
    }
    console.log('ensurePageReady: received pong')
    return tab
  } catch (err) {
    console.warn('ensurePageReady: catch error, will retry', err)
    // wait 100ms and ping again
    await new Promise((resolve) => setTimeout(resolve, 100))
    return ensurePageReady(page)
  }
}
