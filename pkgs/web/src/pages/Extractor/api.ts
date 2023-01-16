import ExtractManager, { Options } from '@substance/common/extract';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia';
import axios, { AxiosError } from 'axios';


export const extractManager = new ExtractManager(WikipediaExtractor)

export async function getExtractedData(url: string, options: Options) {
  const { data } = await axios.get('/api/wikipedia', {
    params: {
      url,
    },
    responseType: 'text',
    timeout: 10 * 1000,
  })

  const result = extractManager.extract(data, url, options)

  return {
    title: result.title,
    contentMarkdown: result.contentMarkdown,
    extraData: result.extraData,
  }
}

export function getErrorMessage(error: any) {
  let msg = ''
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data) {
      try {
        msg = JSON.parse(data).error
      } catch(e) {
      }
    }
    if (!msg) {
      msg = error.message + (data ? ': ' + data : '')
    }
  }
  if (!msg) {
    msg = new String(error).toString()
  }
  return msg.slice(0, 200)
}
