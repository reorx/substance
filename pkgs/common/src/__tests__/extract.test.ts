import ExtractManager from "../extract"
import { WikipediaExtractor } from "../extractors/wikipedia"
import { DataManager } from "./utils"

describe('zh.wikipedia.org', () => {
  const dm = new DataManager('zh.wikipedia.org')
  const {html, url} = dm.getSource()
  const em = new ExtractManager(WikipediaExtractor)

  test('default', () => {
    const {content, contentMarkdown, title} = em.extract(html, url)
    expect(title).toBe('封建')

    // dm.saveResult(null, 'md', contentMarkdown)
    expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
  })

})
