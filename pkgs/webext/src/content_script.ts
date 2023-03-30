import { getMeta } from '@substance/common/metadata';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSelectionHTML } from '@substance/common/utils';

import { MsgType } from './consts';
import { colors, getLogger } from './utils/log';


declare global {
  interface Window {
    _substanceInjectedScripts: any
  }
}

const lg = getLogger('content_script', colors.bgYellowBright)

window._substanceInjectedScripts = window._substanceInjectedScripts || {}
// the name of the injected script must be exactly the same as what isInjected gets
window._substanceInjectedScripts['js/content_script.js'] = true
lg.info('content script injected.')


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  lg.info(`content script onMessage ${msg.type}`, msg)
  switch (msg.type) {
  case MsgType.ExtractCurrentPage0:
    extractCurrentPage().then(() => {
      sendResponse({ result: true })
    })
    break
  }
  return true
})

async function extractCurrentPage() {
  const url = window.location.href
  let html = getSelectionHTML()
  if (!html) {
    html = getHTMLOfDocument()
  }
  const meta = getMeta(document, url)

  // open extractor.html
  const bgMsg = {
    type: MsgType.EnsurePageReady,
    page: 'extractor.html',
  }
  lg.log('send message to background to open extractor', bgMsg)
  const bgRes = await chrome.runtime.sendMessage(bgMsg)
  lg.log(`background response`, bgRes)

  // tell extractor to extract the current page
  const msg = {
    type: MsgType.ExtractCurrentPage1,
    url,
    html,
    meta,
  }
  lg.log('send message to extractor', msg)

  const res = await chrome.runtime.sendMessage(msg)
  lg.log('extractor response', res)
}

export function getHTMLOfDocument() {
  // if the document doesn't have a "base" element make one
  // this allows the DOM parser in future steps to fix relative uris
  let baseEl = document.createElement('base');

  // check for a existing base elements
  let baseEls = document.head.getElementsByTagName('base');
  if (baseEls.length > 0) {
      baseEl = baseEls[0];
  }
  // if we don't find one, append this new one.
  else {
      document.head.append(baseEl);
  }

  // if the base element doesn't have a href, use the current location
  if (!baseEl.getAttribute('href')) {
      baseEl.setAttribute('href', window.location.href);
  }

  // remove the hidden content from the page
  removeHiddenNodes(document.body);

  // get the content of the page as a string
  return document.documentElement.outerHTML;
}

// code taken from here: https://www.reddit.com/r/javascript/comments/27bcao/anyone_have_a_method_for_finding_all_the_hidden/
function removeHiddenNodes(root: Node) {
  let nodeIterator, node,i = 0;

  nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, (node) => {
    let nodeName = node.nodeName.toLowerCase();
    if (nodeName === "script" || nodeName === "style" || nodeName === "noscript" || nodeName === "math") {
      return NodeFilter.FILTER_REJECT;
    }
    if ((node as HTMLElement).offsetParent === void 0) {
      return NodeFilter.FILTER_ACCEPT;
    }
    let computedStyle = window.getComputedStyle(node as Element, null);
    if (computedStyle.getPropertyValue("visibility") === "hidden" || computedStyle.getPropertyValue("display") === "none") {
      return NodeFilter.FILTER_ACCEPT;
    }
    return NodeFilter.FILTER_SKIP;
  });

  while ((node = nodeIterator.nextNode()) && ++i) {
    if (node.parentNode instanceof HTMLElement) {
      node.parentNode.removeChild(node);
    }
  }
  return root
}
