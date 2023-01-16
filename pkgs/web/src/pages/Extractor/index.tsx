import './index.scss';

import { useRef, useState } from 'react';

import { Icon } from '@iconify/react';
import {
  Box, Global, Flex, Grid, Stack, useMantineTheme, TextInput,
  Button, LoadingOverlay,
} from '@mantine/core';
import { NotificationsProvider, showNotification } from '@mantine/notifications';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { extractManager, getExtractedData, getErrorMessage } from './api';
import { Editor } from './Editor';
import { FeedbackModal } from './FeedbackModal';
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
      <FeedbackModal opened={feedbackOpened} onClose={() => setFeedbackOpened(true)} />

      <Stack spacing={0} sx={{
        height: '100%',
      }}>

        <Box p={gutter} sx={{
          borderBottom: '1px solid #ddd'
        }}>
          <Flex className={classes.flexItemGrow}>
            <TextInput
              name="url"
              defaultValue={url}
              ref={inputUrlRef}
              onSubmit={submitUrl}
              icon={<Icon icon="tabler:link" />}
              placeholder="URL"
              radius="sm" size="xs"
              sx={{
                width: 600,
                maxWidth: '50%',
                marginRight: 12,
              }}
            />
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
          <Flex mt={8}>
            <ExtractorOptions options={options} />
          </Flex>
        </Box>
        <Grid gutter={0} className={classes.flexItemGrow}>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow} sx={{
            position: 'relative',
          }}>
            <Editor />
          </Grid.Col>

          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow} sx={{
            position: 'relative',
            borderLeft: '1px solid #ddd',
          }}>
            <Viewer />
          </Grid.Col>
        </Grid>
    </Stack>
    </>
  )
}
