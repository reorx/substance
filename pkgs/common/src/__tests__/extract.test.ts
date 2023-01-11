import _ from "lodash"
import ExtractManager, { matchExtractor } from "../extract"
import { WikipediaExtractor } from "../extractors/wikipedia"
import { DataManager } from "./utils"

describe('zh.wikipedia.org', () => {
  const dm = new DataManager('zh.wikipedia.org')
  const {html, url} = dm.getSource()
  const em = new ExtractManager(WikipediaExtractor)

  test('match', () => {
    // test url match
    expect(matchExtractor(WikipediaExtractor, html, url)).toBeTruthy()
    expect(matchExtractor(WikipediaExtractor, html, 'https://zh.wikipedia.org/foo')).toBeFalsy()

    // test domain match
    const modifiedExtractor0 = _.assign({}, WikipediaExtractor, {
      match: {
        domain: 'zh.wikipedia.org'
      }
    })
    expect(matchExtractor(modifiedExtractor0, html, url)).toBeTruthy()

    // test selectors match
    const modifiedExtractor1 = _.assign({}, WikipediaExtractor, {
      match: {
        selectors: ['#unexisted-id-1234567890']
      }
    })
    expect(matchExtractor(modifiedExtractor1, html, url)).toBeFalsy()
    modifiedExtractor1.match.selectors.push('#bodyContent')
    expect(matchExtractor(modifiedExtractor1, html, url)).toBeTruthy()
  })

  test('default', () => {
    const {content, contentMarkdown, title} = em.extract(html, url)
    expect(title).toBe('封建')

    // dm.saveResult(null, 'md', contentMarkdown)
    expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
  })

})
