import axios from 'axios'
import { Options } from '@substance/common/extract'

export const getExtractedData = async (url: string, options: Options) => {
  const { data } = await axios.post('https://httpbin.org/post', {
  })
  console.log('httpbin res', data)

  return {
    title: data.origin,
    content: data.url,
    contentMarkdown: data.headers['User-Agent'],
  }
}
