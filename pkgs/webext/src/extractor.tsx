import React from 'react';
import { createRoot } from 'react-dom/client';

import { MsgType } from './consts';
import { useExtractorStore } from './store';
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
    useExtractorStore.setState({
      page: {
        url,
        html,
        meta,
      }
    })
    break
  }
  // return true
})


export default function CustomPage() {
  const page = useExtractorStore((state) => state.page)
  if (!page) return (
    <div>loading</div>
  )
  return (
    <div>
      <h1>Welcome to my app</h1>
      <div>{page.html}</div>
    </div>
  );
}


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <CustomPage />
  </React.StrictMode>
);
