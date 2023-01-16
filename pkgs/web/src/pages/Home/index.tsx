import { useRef } from 'react';

import { Icon } from '@iconify/react';
import {
  Container, Global, TextInput, Stack, ActionIcon, useMantineTheme,
} from '@mantine/core';
import { createSearchParams, useNavigate } from 'react-router-dom';

import { HomeFooter } from './Footer';
import { HomeHeader } from './Header';
import { HeroText } from './Hero';


export function HomePage() {
  const theme = useMantineTheme();
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const getInputValue = () => inputRef.current?.value

  const enterAction = (event: any) => {
    if (event.key === 'Enter') {
      const url = getInputValue()
      if (!url) return
      navigate({
        pathname: '/extractor',
        search: `?${createSearchParams({
          url,
        })}`
      })
    }
  }

  return (
    <Stack justify="space-between" sx={{
      height: '100%',
    }}>
      <Global
        styles={(theme) => ({
          'html, body, #root': {
            height: '100%',
          }
        })}
      />
      <HomeHeader />

      <Container sx={{
          flexGrow: 1,
        }}
        >
        <HeroText/>
        <Container size="sm">
          <TextInput
            ref={inputRef}
            icon={<Icon icon="tabler:link" />}
            radius="md"
            size="md"
            width="500px"
            rightSection={
              <ActionIcon size={32} radius="md" color={theme.primaryColor} variant="filled">
                <Icon icon="tabler:arrow-right" />
              </ActionIcon>
            }
            placeholder="Paste Wikipedia URL here"
            rightSectionWidth={42}
            onKeyDown={enterAction}
          />
        </Container>
      </Container>
      <HomeFooter/>
    </Stack>
  )
}
