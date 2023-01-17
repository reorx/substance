import './index.scss';

import { memo, useRef, useState } from 'react';

import { Icon } from '@iconify/react';
import {
  Box, Global, Flex, Grid, Stack, useMantineTheme, TextInput,
  Button, LoadingOverlay, ActionIcon,
} from '@mantine/core';
import { NotificationsProvider, showNotification } from '@mantine/notifications';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { usePageTitle } from '@/utils';

import { extractManager, getExtractedData, getErrorMessage } from './api';
import { Editor } from './Editor';
import { FeedbackModal } from './FeedbackModal';
import { HelpModal } from './HelpModal';
import { ExtractorOptions } from './Options';
import { useStore } from './store';
import { gutter, useStyles } from './styles';
import { Viewer } from './Viewer';


const queryClient = new QueryClient()

export function ExtractorPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <ExtractorPageMain />
      </NotificationsProvider>
    </QueryClientProvider>
  )
}

const EditorMemo = memo(Editor)
const ViewerMemo = memo(Viewer)

const options = extractManager.getDefaultOptions()

function ExtractorPageMain() {
  console.info('render ExtractorPageMain')
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const queryClient = useQueryClient()

  /* params */
  const [searchParams, setSearchParams] = useSearchParams()
  const url = searchParams.get('url') || ''
  const inputUrlRef = useRef<HTMLInputElement>(null)
  const getInputUrl = () => inputUrlRef.current?.value

  /* states */
  const [feedbackOpened, setFeedbackOpened] = useState(false)
  const [helpOpened, setHelpOpened] = useState(false)

  const submitUrl = () => {
    const params = {
      url: getInputUrl() || '',
    }
    queryClient.invalidateQueries({
      queryKey: ['extract', params.url],
    })
    setSearchParams(params)
  }

  const { isLoading, isInitialLoading, isError, isLoadingError, isSuccess, isRefetching } = useQuery({
    queryKey: ['extract', url],
    queryFn: async () => {
      // console.log('use options', options)
      return await getExtractedData(url, options)
    },
    onSuccess: (data) => {
      useStore.setState({
        title: data.title,
        contentMarkdown: data.contentMarkdown,
        extraData: data.extraData,
      })
    },
    onError: (error) => {
      showNotification({
        title: 'Extraction failed',
        message: getErrorMessage(error),
        color: 'pink',
      })
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!url,
    retry: false,
  })
  console.log('query', isLoading, isInitialLoading, isError, isLoadingError, isRefetching)

  const enterAction = (event: any) => {
    if (event.key === 'Enter') {
      submitUrl()
    }
  }

  usePageTitle('Substance Web')

  return (
    <>
      <Global
        styles={(theme) => ({
          'html, body, #root': {
            height: '100%',
          }
        })}
      />
      <LoadingOverlay visible={!!url && (isLoading || isRefetching)} />
      <FeedbackModal opened={feedbackOpened} onClose={() => setFeedbackOpened(false)} />
      <HelpModal opened={helpOpened} onClose={() => setHelpOpened(false)} />

      <Stack spacing={0} sx={{
        height: '100%',
      }}>

        <Box p={gutter} sx={{
          borderBottom: '1px solid #ddd'
        }}>
          <Flex className={classes.flexItemGrow} align='center'>
            <ActionIcon variant='transparent' mr={gutter} color='dark'>
              <Icon icon="tabler:link" />
            </ActionIcon>
            <TextInput
              name="url"
              defaultValue={url}
              ref={inputUrlRef}
              onSubmit={submitUrl}
              placeholder="URL"
              radius="sm" size="xs"
              sx={{
                width: 600,
                maxWidth: '50%',
                marginRight: gutter,
              }}
              onKeyDown={enterAction}
            />
            <ActionIcon variant='subtle' mr={gutter} color='yellow.6'
              onClick={() => setHelpOpened(true)}
            >
              <Icon icon="mdi:question-mark-circle" width={18} />
            </ActionIcon>
            <Button color="yellow" size="xs"
              onClick={submitUrl}
            >
              Extract
            </Button>
            <Box className='header-nav'>
              <Link to='/'>
                <Button variant="subtle" color="gray" compact>Home</Button>
              </Link>
              <Button variant="subtle" color="gray" compact onClick={() => setFeedbackOpened(true)}>Feedback</Button>
            </Box>
          </Flex>
          <ExtractorOptions options={options} />
        </Box>
        <Grid gutter={0} className={classes.flexItemGrow}>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow} sx={{
            position: 'relative',
          }}>
            <EditorMemo />
          </Grid.Col>

          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow} sx={{
            position: 'relative',
            borderLeft: '1px solid #ddd',
          }}>
            <ViewerMemo />
          </Grid.Col>
        </Grid>
    </Stack>
    </>
  )
}
