import {
  colors,
  getLogger,
} from './utils/log';

const lg = getLogger('background', colors.green)

lg.log('background.ts')

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    lg.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

const menuIdCustomPage = "substance-custom-page"

chrome.contextMenus.create({
  id: menuIdCustomPage,
  title: "Custom Page",
  contexts: ["action"],
  // contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  lg.info('contextMenus.onClicked')
  if (info.menuItemId == menuIdCustomPage) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/custom_page.html')
    });
  }
})
