// import { colors, getLogger } from './utils/log';
// const lg = getLogger('content_script', colors.bgYellowBright)

console.info('content_script.ts!1')

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.info(`message received: ${msg}`)
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});
