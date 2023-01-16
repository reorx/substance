import axios from 'axios'
import ExtractManager, { Options } from '@substance/common/extract'
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'

export async function getExtractedData(url: string, options: Options) {
  const { data } = await axios.get('/api/wikipedia', {
    params: {
      url,
    },
    responseType: 'text',
    timeout: 10 * 1000,
  })

  const em = new ExtractManager(WikipediaExtractor)
  const result = em.extract(data, url, options)

  return {
    title: result.title,
    contentMarkdown: result.contentMarkdown,
  }
}
