import { MsgType } from './consts';
import { ensurePageReady, getCurrentTab, injectScriptInTab } from './utils/browserAPI';
import { colors, getLogger } from './utils/log';


const lg = getLogger('background', colors.green)

lg.log('background.ts')


/* command handler */

enum Command {
  ExtractCurrentPage = 'ExtractCurrentPage',
}

chrome.commands.onCommand.addListener(async (command) => {
  lg.log(`onCommand: ${command}`)
  switch (command) {
    case Command.ExtractCurrentPage:
      await extractCurrentPageCommand()
      break
  }
})


/* message handler */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  lg.log(`onMessage: ${msg.type}`)
  switch (msg.type) {
    case MsgType.EnsurePageReady:
      ensurePageReady(msg.page).then(tab => {
        lg.log(`send ${msg.type} response to ${sender}`)
        sendResponse({ result: tab.id })
      })
  }
  return true
})


/* menus handler */

const menuIdExtractCurrentPage = `substance-${Command.ExtractCurrentPage}`

chrome.contextMenus.create({
  id: menuIdExtractCurrentPage,
  title: "Extract current page",
  // contexts: ["action", "page"],
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId == menuIdExtractCurrentPage) {
    await extractCurrentPageCommand()
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL('/extractor.html')
    // });
  }
})

/* functions */

export const extractCurrentPageCommand = async () => {
  const tab = await getCurrentTab()
  if (!tab) return
  await injectScriptInTab('js/content_script.js', tab)

  const msg = {
    type: MsgType.ExtractCurrentPage0,
  }
  lg.info('send message to tab', tab.id, msg)
  await chrome.tabs.sendMessage(tab.id as number, msg)
}
