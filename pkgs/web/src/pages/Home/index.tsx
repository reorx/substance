import { Container, Global } from '@mantine/core';

import { HomeHeader } from './Header';
import { HomeFooter } from './Footer';
import { HeroText } from './Hero';
import { Icon } from '@iconify/react';

import { TextInput, Flex, Stack, ActionIcon, useMantineTheme } from '@mantine/core';

export function HomePage() {
  const theme = useMantineTheme();

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
      <HomeHeader links={[
        {
          link: '/extractor',
          label: 'Open Extractor',
          button: true,
        }
      ]} />

      <Container sx={{
          flexGrow: 1,
        }}
        >
        <HeroText/>
        <Container size="sm">
          <TextInput
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
          />
        </Container>
      </Container>
      <HomeFooter/>
    </Stack>
  )
}
