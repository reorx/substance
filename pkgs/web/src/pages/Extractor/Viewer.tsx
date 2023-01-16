import './Viewer.scss';

import { useRef } from 'react';

import { Icon } from '@iconify/react';
import { Flex, TextInput, Button } from '@mantine/core';

import { renderMarkdown } from './markdown';
import { useStore } from './store';
import { gutter, useStyles } from './styles';


export function Viewer()  {
  const {classes} = useStyles()
  const contentRef = useRef<HTMLDivElement>(null)

  const title = useStore((state) => state.title)
  const contentMarkdown = useStore((state) => state.contentMarkdown)
  const extraData = useStore((state) => state.extraData)

  return (
    <>
      <Flex sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: gutter,
        height: 46,
        background: '#ffffff',
        zIndex: 1,
      }}>
        <TextInput variant="filled" placeholder="Title" value={title}
          onChange={(e) => useStore.setState({ title: e.currentTarget.value })}
          size="xs"
          sx={{
            flexGrow: 1,
            marginRight: gutter,
          }}
        />
        <Button size="xs"
          rightIcon={<Icon icon="fa-brands:markdown" css={{
            fontSize: '18px',
          }} />}
        >Download</Button>
      </Flex>
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(contentMarkdown) }}
        className="markdown"
      ></div>
    </>
  )
}
