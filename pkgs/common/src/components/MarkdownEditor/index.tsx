import './index.scss';

import { useEffect, useState } from 'react';

import { markdown as cmMarkdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { Icon } from '@iconify/react';
import {
  ActionIcon, Box, Button, Code, Flex, Popover, Text,
  TextInput,
} from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';

import { listenWindowResize, downloadContent } from '../../utils/dom';
import { useMarkdownStore } from '../stores';
import { gutter } from '../styles';


// import { BlockquotePlugin } from './theme';
// import { githubLight } from './theme-githubLight';


export function MarkdownEditor() {
  console.debug('render Editor')
  const contentMarkdown = useMarkdownStore((state) => state.contentMarkdown)
  const title = useMarkdownStore((state) => state.title)
  const extraData = useMarkdownStore((state) => state.extraData)
  const getFilename = () => `${title}.md`

  const getEditorHeight = () => {
    // - header - top-panel - complement
    return window.innerHeight - 80 - 48 - 1
  }
  const [editorHeight, setEditorHeight] = useState(() => getEditorHeight() )

  useEffect(() => {
    listenWindowResize(() => {
      setEditorHeight(getEditorHeight())
    })
  }, [])

  return (
    <Box className='editor'>
      <Flex className="top-panel">
        <Popover width={300} position="bottom-start"
          withArrow shadow='lg'>
          <Popover.Target>
            <ActionIcon variant='subtle' color='yellow.6' mr={gutter}>
              <Icon icon="clarity:info-circle-solid" width={22}/>
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size='sm' fw='bold'>Extra data:</Text>
            <Code block className='extradata'>{JSON.stringify(extraData)}</Code>
          </Popover.Dropdown>
        </Popover>

        <TextInput variant="filled" placeholder="Title" value={title}
          onChange={(e) => useMarkdownStore.setState({ title: e.currentTarget.value })}
          size="xs"
          sx={{
            flexGrow: 1,
            marginRight: gutter,
          }}
        />

        <Button size="xs"
          color="yellow.6"
          variant='subtle'
          rightIcon={<Icon icon="fa-brands:markdown" />}
          onClick={() => {
            downloadContent(getFilename(), contentMarkdown)
          }}
        >Download</Button>
      </Flex>

      <Box className='main'>
        <CodeMirror
          value={contentMarkdown}
          height={`${editorHeight}px`}
          extensions={[
            EditorView.theme({
              '&': {
                fontSize: '13px',
              },
              '.cm-content': {
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
              }
            }),
            EditorView.lineWrapping,
            // langs.markdown(),
            cmMarkdown({ base: markdownLanguage }),
            // ViewPlugin.define((view) => new BlockquotePlugin(view), { decorations: (v) => v.decorations }),
          ]}
          // theme={githubLight}
          basicSetup={{
            highlightActiveLine: false,
            foldGutter: false,
            allowMultipleSelections: false,
            indentOnInput: false,
          }}
          onChange={(contentMarkdown) => {
            useMarkdownStore.setState({ contentMarkdown })
          }}
        />
      </Box>
    </Box>
  )
}
