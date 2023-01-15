import { Box, Global, Flex, Grid, Stack, createStyles, useMantineTheme, TextInput, Button, Switch, Tooltip, Text, Code, Overlay, LoadingOverlay, Notification } from '@mantine/core';
import { Icon } from '@iconify/react';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'
import { Form, useSearchParams } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getExtractedData } from './api';
import { Options } from '@substance/common/extract';
import { NotificationsProvider, showNotification } from '@mantine/notifications';
import {AxiosError} from 'axios'

const useStyles = createStyles((theme) => ({
  flexItemGrow: {
    flexGrow: 1,
  },
  innerLabel: {
    cursor: 'pointer',
  }
}))

const gutter = 8

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

function getErrorMessage(error: any) {
  let msg = ''
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data) {
      msg = JSON.parse(data).error
    }
  }
  if (!msg) {
    msg = new String(error).toString()
  }
  return msg
}

function ExtractorPageMain() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [searchParams, _] = useSearchParams()
  const url = searchParams.get('url') || ''
  console.log('param url', url)
  const extractorOptions: Options = {}
  const queryClient = useQueryClient()

  const { data, isLoading, isError, isLoadingError, isSuccess, error } = useQuery({
    queryKey: ['extract', url],
    queryFn: async () => {
      return await getExtractedData(url, extractorOptions)
    },
    enabled: !!url,
    retry: false,
  })
  console.log('query', isLoading, isError, isLoadingError, isSuccess)

  if (isError) {
    showNotification({
      title: 'Extraction failed',
      message: getErrorMessage(error),
      color: 'pink',
    })
  }

  return (
    <>
      <Global
        styles={(theme) => ({
          'html, body, #root': {
            height: '100%',
          }
        })}
      />
      <LoadingOverlay visible={isLoading && !isError} />

      <Stack spacing={0} sx={{
        height: '100%',
      }}>

        <Box p={gutter}>
          <Form method="get" action="/extractor">
          <Flex className={classes.flexItemGrow}>
            <TextInput
              name="url"
              defaultValue={url}
              icon={<Icon icon="tabler:link" />}
              radius="sm"
              size="xs"
              w={600}
              maw="50%"
              placeholder="URL"
              mr={12}
            />
            <Button type="submit" color="yellow" size="xs">
              Extract
            </Button>
          </Flex>
          <Flex mt={8}>
            <Text fz="sm" lh="1.3" mr={16} fw={700}>Options:</Text>
            {Object.keys(WikipediaExtractor.options).map((key) => (
              <Switch mr={32} name={key} key={key} label={
                <Tooltip
                  withArrow
                  multiline
                  width={300}
                  position="bottom"
                  label={WikipediaExtractor.options[key].help}>
                  <span className={classes.innerLabel}>{key}</span>
                </Tooltip>
              } />
            ))}
          </Flex>
          </Form>
        </Box>
        <Grid gutter={0} className={classes.flexItemGrow}>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow}>
            {data?.contentMarkdown ? (
              <Code block>{data.contentMarkdown}</Code>
            ) : (
              <Text>Nothing to show</Text>
            )}
          </Grid.Col>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow}>
            {data?.contentMarkdown ? (
              <Code block>{data.contentMarkdown}</Code>
            ) : (
              <Text>Nothing to show</Text>
            )}
          </Grid.Col>
        </Grid>
    </Stack>
    </>
  )
}

/*
// props: content, isLoading
function CodeBlock({ content, isLoading }: { content: string, isLoading: boolean }) {
  return (

  )
}
*/
