import { Box, Global, Flex, Grid, Stack, createStyles, useMantineTheme, TextInput, Button, Switch, Tooltip, Text, Code, Overlay, LoadingOverlay } from '@mantine/core';
import { Icon } from '@iconify/react';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'
import { Form, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import { EditorView, ViewPlugin } from '@codemirror/view'
import {AxiosError} from 'axios'
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import { listenWindowResize } from '@/utils';
import { githubLight } from './theme-githubLight';
import { BlockquotePlugin } from './theme'
import { markdown as cmMarkdown, markdownLanguage } from '@codemirror/lang-markdown'
import {renderMarkdown} from './markdown'
import './markdown.scss'
import { useInputState } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  flexItemGrow: {
    flexGrow: 1,
  },
  innerLabel: {
    cursor: 'pointer',
  },
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
      try {
        msg = JSON.parse(data).error
      } catch(e) {
        msg = data
      }
    }
  }
  if (!msg) {
    msg = new String(error).toString()
  }
  return msg
}

function getEditorHeight() {
  return window.innerHeight - 100
}

function ExtractorPageMain() {
  console.info('render ExtractorPageMain')
  const theme = useMantineTheme();
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams()
  const { classes } = useStyles();
  const url = searchParams.get('url') || ''
  const [inputUrl, setInputUrl] = useInputState(url)
  // console.log('param url', url, 'input url', inputUrl)
  const extractorOptions: Options = {}
  const queryClient = useQueryClient()
  const [editorHeight, setEditorHeight] = useState(() => getEditorHeight() )
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [title, setTitle] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  const submitUrl = () => {
    const params = {
      url: inputUrl
    }
    queryClient.invalidateQueries({
      queryKey: ['extract', params.url],
    })
    setSearchParams(params)
  }

  const { isLoading, isInitialLoading, isError, isLoadingError, isSuccess, isRefetching } = useQuery({
    queryKey: ['extract', url],
    queryFn: async () => {
      return await getExtractedData(url, extractorOptions)
    },
    onSuccess: (data) => {
      setContentMarkdown(data.contentMarkdown)
      setTitle(data.title)
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

  useEffect(() => {
    listenWindowResize(() => {
      setEditorHeight(getEditorHeight())
    })
  }, [])

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

      <Stack spacing={0} sx={{
        height: '100%',
      }}>

        <Box p={gutter} sx={{
          borderBottom: '1px solid #ddd'
        }}>
          <Flex className={classes.flexItemGrow}>
            <TextInput
              name="url"
              value={inputUrl}
              onChange={setInputUrl}
              icon={<Icon icon="tabler:link" />}
              placeholder="URL"
              radius="sm"
              size="xs"
              w={600}
              maw="50%"
              mr={12}
              onSubmit={submitUrl}
            />
            <Button color="yellow" size="xs"
              onClick={submitUrl}
            >
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
        </Box>
        <Grid gutter={0} className={classes.flexItemGrow}>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow}>
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
              onChange={(content) => {
                setContentMarkdown(content)
              }}
            />
          </Grid.Col>
          <Grid.Col span={6} p={gutter} className={classes.flexItemGrow} sx={{
            position: 'relative',
          }}>
            <Flex sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              padding: gutter,
              height: 46,
              background: '#ffffff',
              zIndex: 1,
            }}>
              <TextInput variant="filled" placeholder="Title" value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                size="xs"
                sx={{
                  flexGrow: 1,
                  marginRight: gutter,
                }}
              />
              <Button size="xs"
                rightIcon={<Icon icon="fa-brands:markdown" css={{
                  fontSize: '18px',
                }}/>}
              >Download</Button>
            </Flex>
            <div
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(contentMarkdown) }}
              className="markdown"
            ></div>
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
