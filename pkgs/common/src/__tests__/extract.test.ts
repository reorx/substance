import _ from 'lodash';

import ExtractManager, { matchExtractor } from '../extract';
import { WikipediaExtractor } from '../extractors/wikipedia';
import { DataManager } from './utils';

const saveOnly = false
// const saveOnly = true

describe('zh.wikipedia.org', () => {

  describe('fengjian', () => {
    const dm = new DataManager('zh.wikipedia.org/fengjian')
    const {html, url} = dm.getSource()
    const em = new ExtractManager(WikipediaExtractor)

    test('match', () => {
      // test url match
      expect(matchExtractor(WikipediaExtractor, html, url)).toBeTruthy()
      expect(matchExtractor(WikipediaExtractor, html, 'https://zh.m.wikipedia.org/foo')).toBeTruthy()
      expect(matchExtractor(WikipediaExtractor, html, 'https://zh.m.wikimedia.org/foo')).toBeFalsy()

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

      if (saveOnly) {
        dm.saveResult(null, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
      }
    })

    test('removeLinks', () => {
      const variant = 'removeLinks'
      const {content, contentMarkdown, title} = em.extract(html, url, {
        removeLinks: true
      })

      if (saveOnly) {
        dm.saveResult(variant, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(variant, 'md'))
      }
    })

    test('getTagsFromCategories', () => {
      const {content, contentMarkdown, extraData} = em.extract(html, url, {
        getTagsFromCategories: true
      })

      expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
      expect(extraData.tags).toStrictEqual(["历史学", "封建制度"])
    })
  })

  describe('ashima', () => {
    const dm = new DataManager('zh.wikipedia.org/ashima')
    const {html, url} = dm.getSource()
    const em = new ExtractManager(WikipediaExtractor)

    test('default', () => {
      const {content, contentMarkdown, title} = em.extract(html, url)
      expect(title).toBe('阿诗玛')

      if (saveOnly) {
        dm.saveResult(null, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
      }
    })
  })

})

describe('en.wikipedia.org', () => {
  describe('feudalism', () => {
    const dm = new DataManager('en.wikipedia.org/feudalism')
    const {html, url} = dm.getSource()
    const em = new ExtractManager(WikipediaExtractor)

    test('default', () => {
      const {content, contentMarkdown, title} = em.extract(html, url)
      expect(title).toBe('Feudalism')

      if (saveOnly) {
        dm.saveResult(null, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
      }
    })

    test('removeImages', () => {
      const variant = 'removeImages'
      const {content, contentMarkdown, title} = em.extract(html, url, {
        removeImages: true,
      })
      expect(title).toBe('Feudalism')

      if (saveOnly) {
        dm.saveResult(variant, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(variant, 'md'))
      }
    })

    test('removeTables', () => {
      const variant = 'removeTables'
      const { contentMarkdown } = em.extract(html, url, {
        removeTables: true,
      })

      if (saveOnly) {
        dm.saveResult(variant, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(variant, 'md'))
      }
    })

    test('keepFigureImage', () => {
      const variant = 'keepFigureImage'
      const {content, contentMarkdown, title} = em.extract(html, url, {
        keepFigureImage: true,
      })
      expect(title).toBe('Feudalism')

      if (saveOnly) {
        dm.saveResult(variant, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(variant, 'md'))
      }
    })
  })
})

describe('en.m.wikipedia.org', () => {
  describe('feudalism', () => {
    const dm = new DataManager('en.m.wikipedia.org/feudalism')
    const {html, url} = dm.getSource()
    const em = new ExtractManager(WikipediaExtractor)

    test('default', () => {
      const {content, contentMarkdown, title} = em.extract(html, url)
      expect(title).toBe('Feudalism')

      if (saveOnly) {
        dm.saveResult(null, 'md', contentMarkdown)
      } else {
        expect(contentMarkdown).toBe(dm.getResult(null, 'md'))
      }
    })
  })
})
