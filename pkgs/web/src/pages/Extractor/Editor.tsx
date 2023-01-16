import { useEffect, useState } from 'react';

import { markdown as cmMarkdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView, ViewPlugin } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';

import { listenWindowResize } from '@/utils';

import { useStore } from './store';
import { BlockquotePlugin } from './theme';
import { githubLight } from './theme-githubLight';


function getEditorHeight() {
  return window.innerHeight - 100
}


export function Editor() {
  const contentMarkdown = useStore((state) => state.contentMarkdown)

  const [editorHeight, setEditorHeight] = useState(() => getEditorHeight() )

  useEffect(() => {
    listenWindowResize(() => {
      setEditorHeight(getEditorHeight())
    })
  }, [])

  return (
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
  )
}
