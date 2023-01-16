import './Editor.scss';

import { useEffect, useState } from 'react';

import { markdown as cmMarkdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView, ViewPlugin } from '@codemirror/view';
import { Icon } from '@iconify/react';
import {
  Box, Button, Code, Flex, Popover, Text, TextInput,
} from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';

import { listenWindowResize } from '@/utils';

import { downloadContent } from './download';
import { useStore } from './store';
import { gutter } from './styles';
import { BlockquotePlugin } from './theme';
import { githubLight } from './theme-githubLight';


export function Editor() {
  const contentMarkdown = useStore((state) => state.contentMarkdown)
  const title = useStore((state) => state.title)
  const extraData = useStore((state) => state.extraData)
  const getFilename = () => `${title}.md`

  const getEditorHeight = () => {
    // - header - top-panel - complement
    return window.innerHeight - 80 - 46 - 1
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
            <Button size="xs" color='gray' variant='subtle'
              mr={gutter}
              styles={{
                root: {
                  padding: '0 2px',
                }
              }}>
              <Icon icon="clarity:info-circle-solid" color='#333' width={25}/>
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size='sm' fw='bold'>Extra data:</Text>
            <Code block className='extradata'>{JSON.stringify(extraData)}</Code>
          </Popover.Dropdown>
        </Popover>

        <TextInput variant="filled" placeholder="Title" value={title}
          onChange={(e) => useStore.setState({ title: e.currentTarget.value })}
          size="xs"
          sx={{
            flexGrow: 1,
            marginRight: gutter,
          }}
        />

        <Button size="xs"
          color="yellow"
          variant='subtle'
          rightIcon={<Icon icon="fa-brands:markdown" css={{
            fontSize: '18px',
          }} />}
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
            ViewPlugin.define((view) => new BlockquotePlugin(view), { decorations: (v) => v.decorations }),
          ]}
          theme={githubLight}
          basicSetup={{
            highlightActiveLine: false,
            foldGutter: false,
            allowMultipleSelections: false,
            indentOnInput: false,
          }}
          onChange={(contentMarkdown) => {
            useStore.setState({ contentMarkdown })
          }}
        />
      </Box>
    </Box>
  )
}
