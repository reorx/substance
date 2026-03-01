import React from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Global, Grid } from '@mantine/core';
import ExtractManager from '@substancejs/common/extract';
import { WikipediaExtractor } from '@substancejs/common/extractors/wikipedia';

import { MarkdownEditor } from '@substancejs/common/components/MarkdownEditor';
import { Viewer as MarkdownViewer } from '@substancejs/common/components/MarkdownViewer';
import { gutter } from '@substancejs/common/components/styles';
import { useMarkdownStore } from '@substancejs/common/components/stores';

import { MsgType } from './consts';
import { colors, getLogger } from './utils/log';


const lg = getLogger('extractor', colors.bgYellowBright)
const extractManager = new ExtractManager(WikipediaExtractor)

lg.info('extractor.tsx')

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  lg.info(`extractor received ${msg.type}`)
  switch (msg.type) {
  case MsgType.Ping:
    sendResponse({ pong: 1 })
    break
  case MsgType.ExtractCurrentPage1: {
    const { url, html, meta } = msg
    lg.log('page', url, html, meta)
    try {
      const { title, contentMarkdown, extraData } = extractManager.extract(html, url)
      useMarkdownStore.setState({
        url,
        title: title || meta.title || '',
        contentMarkdown,
        extraData: {
          ...extraData,
          _meta: meta,
        },
      })
      sendResponse({ yes: 1 })
    } catch (error) {
      const errMsg = String(error)
      lg.error('extract failed', errMsg)
      sendResponse({ yes: 0, error: errMsg })
    }
    break
  }
  }
  // return true
})


export default function ExtractorPage() {
  const contentMarkdown = useMarkdownStore((state) => state.contentMarkdown)

  return (
    <>
      <Global
        styles={{
          'html, body, #root': {
            height: '100%',
            margin: 0,
          },
        }}
      />
      {!contentMarkdown && (
        <Box p="md">Run &quot;Extract current page&quot; to start.</Box>
      )}
      {!!contentMarkdown && (
        <Grid gutter={0} sx={{ height: '100%' }}>
          <Grid.Col span={6} p={gutter} sx={{ position: 'relative' }}>
            <MarkdownEditor />
          </Grid.Col>
          <Grid.Col span={6} p={gutter} sx={{ position: 'relative', borderLeft: '1px solid #ddd' }}>
            <MarkdownViewer />
          </Grid.Col>
        </Grid>
      )}
    </>
  );
}


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ExtractorPage />
  </React.StrictMode>
);
