import './Viewer.scss';

import { useEffect, useRef } from 'react';

import { Icon } from '@iconify/react';
import { Button, Flex, Paper, Text } from '@mantine/core';
import tocbot from 'tocbot';

import useComponentVisible from '@/utils';

import { renderMarkdown } from './markdown';
import { useStore } from './store';
import { gutter } from './styles';


export function Viewer()  {
  const contentRef = useRef<HTMLDivElement>(null)
  const tocButtonRef = useRef<HTMLButtonElement>(null)
  const { ref: tocRef, isVisible: isTocVisible, setIsVisible: setTocVisible } = useComponentVisible(false, tocButtonRef)

  const title = useStore((state) => state.title)
  const contentMarkdown = useStore((state) => state.contentMarkdown)

  useEffect(() => {
    tocbot.init({
      tocSelector: '.toc',
      contentSelector: '.markdown'
    })
  }, [contentMarkdown])

  return (
    <div className="viewer">

      <Flex className="top-panel">
        <Text size='lg' fw='bold' sx={{
          flexGrow: 1,
        }}>{title}</Text>

        <Button size="xs" color='gray' variant='outline'
          ml={gutter}
          styles={{
            root: {
              padding: '0 2px',
            }
          }}
          ref={tocButtonRef}
          onClick={(e) => {
            setTocVisible(!isTocVisible)
          }}
        >
          <Icon icon="mdi:table-of-contents" color='#000' width={25}/>
        </Button>
      </Flex>

      <Paper ref={tocRef} shadow="sm" p="sm" withBorder className="toc" sx={{
        visibility: isTocVisible ? 'visible' : 'hidden'
      }}></Paper>

      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(contentMarkdown) }}
        className="markdown"
      ></div>

    </div>
  )
}
