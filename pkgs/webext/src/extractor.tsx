import React from 'react';
import { createRoot } from 'react-dom/client';

import { MsgType } from './consts';
import { colors, getLogger } from './utils/log';


const lg = getLogger('extractor', colors.bgYellowBright)

lg.info('extractor.tsx')

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  lg.info(`extractor received ${msg.type}`)
  switch (msg.type) {
  case MsgType.Ping:
    sendResponse({ pong: 1 })
    break
  case MsgType.ExtractCurrentPage1:
    const { url, html, meta } = msg
    lg.log('page', url, html, meta)
    sendResponse({ yes: 1 })
    break
  }
  // return true
})


export default function CustomPage() {
  return (
    <div>
      <h1>Welcome to my app</h1>
    </div>
  );
}


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <CustomPage />
  </React.StrictMode>
);
