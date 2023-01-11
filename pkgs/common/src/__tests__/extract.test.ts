import ExtractorManager from "../extract"
import { WikipediaExtractor } from "../extractors/wikipedia"
import { readHTMLData, readMarkdown, writeMarkdown } from "./utils"

test('zh.wikipedia.org', () => {
  const fileprefix = 'zh.wikipedia.org'
  const {html, url} = readHTMLData(fileprefix)
  const manager = new ExtractorManager(WikipediaExtractor)

  const {content, contentMarkdown, title} = manager.extract(html, url)
  expect(title).toBe('封建')

  // writeMarkdown(fileprefix, contentMarkdown)
  expect(contentMarkdown).toBe(readMarkdown(fileprefix))
})
