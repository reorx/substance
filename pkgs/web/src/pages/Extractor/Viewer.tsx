import './Viewer.scss';

import { useEffect, useRef } from 'react';

import { Icon } from '@iconify/react';
import { ActionIcon, Flex, Paper, Text } from '@mantine/core';
import tocbot from 'tocbot';

import { useComponentVisible } from '@/utils';

import { renderMarkdown } from './markdown';
import { useStore } from './store';
import { gutter } from './styles';


export function Viewer()  {
  console.debug('render Viewer')
  const contentRef = useRef<HTMLDivElement>(null)
  const tocButtonRef = useRef<HTMLButtonElement>(null)
  const { ref: tocRef, isVisible: isTocVisible, setIsVisible: setTocVisible } = useComponentVisible(false, tocButtonRef)

  const title = useStore((state) => state.title)
  const contentMarkdown = useStore((state) => state.contentMarkdown)

  useEffect(() => {
    tocbot.init({
      tocSelector: '.toc',
      contentSelector: '.viewer-markdown'
    })
    if (tocRef.current?.children.length === 0) {
      tocRef.current.innerHTML = 'No index'
    }
  }, [contentMarkdown])

  return (
    <div className="viewer">

      <Flex className="top-panel">
        <Text size='lg' fw='bold' sx={{
          flexGrow: 1,
        }}>{title}</Text>

        <ActionIcon variant='light' color='yellow.8'
          ref={tocButtonRef}
          ml={gutter}
          onClick={(e) => {
            setTocVisible(!isTocVisible)
          }}
        >
          <Icon icon="mdi:table-of-contents" width={20} />
        </ActionIcon>
      </Flex>

      <Paper ref={tocRef} shadow="sm" p="sm" withBorder className="toc" sx={{
        visibility: isTocVisible ? 'visible' : 'hidden'
      }}>No index</Paper>

      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(contentMarkdown) }}
        className="viewer-markdown"
      ></div>

    </div>
  )
}
