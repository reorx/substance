import axios from 'axios'
import ExtractManager, { Options } from '@substance/common/extract'
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'

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
