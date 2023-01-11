import {load, CheerioAPI, Cheerio, AnyNode, Element } from 'cheerio';
import TurndownService from 'turndown';
import { getAbsUrl, getBaseUrl } from './utils';
import { ElementType } from 'domelementtype'


export interface OptionsDef {
  [key: string]: {
    help: string
    default: any
  }
}
export interface Options {
  [key: string]: any
}

// alias to cheerio types
type CheerioElement = Cheerio<Element>

export interface State {
  html: string
  url: string
  options: Options
  baseUrl: string
  $: CheerioAPI
  $content: CheerioElement
  sharedData: any
}
export interface PropertyHandler {
  selectors: string[]
  process?: ($: CheerioAPI, $el: CheerioElement, state: State) => string
}
export interface ExtractResult {
  title: string
  content: string
  contentMarkdown: string
  excerpt: string
  author: string
  publishedDate: string
  extraData: any
}

export interface Extractor {
  // match all the conditions
  match: {
    domain?: string|RegExp
    url?: RegExp
    // match any selector in the array
    selectors?: string[]
  }
  options: OptionsDef
  content: {
    selectors: string[]
    clean: string[]
    transforms: {
      [selector: string]: ($el: CheerioElement, state: State) => void
    }
    processElement?: ($: CheerioAPI, $el: CheerioElement, state: State) => void
    process?: ($: CheerioAPI, $el: CheerioElement, state: State) => string
    turndown?: {
      options: TurndownService.Options
      customize?: ($: CheerioAPI, turndownService: TurndownService, state: State) => void
    }
    markdown?: ($: CheerioAPI, $el: CheerioElement, turndownService: TurndownService, state: State) => string
  }
  title: PropertyHandler
  excerpt?: PropertyHandler
  author?: PropertyHandler
  publishedDate?: PropertyHandler
  extraData: ($: CheerioAPI, state: State) => any
}


// create a class called ExtractManager, the constructor takes a extractor object
export class ExtractManager {
  extractor: Extractor
  turndownOptions?: TurndownService.Options

  constructor(extractor: Extractor, turndownOptions?: TurndownService.Options) {
    this.extractor = extractor
    this.turndownOptions = turndownOptions
  }

  getDefaultOptions(): Options {
    const optionsDef = this.extractor.options
    const defaultOptions: Options = {}

    if (optionsDef) {
      Object.keys(optionsDef).forEach(key => {
        defaultOptions[key] = optionsDef[key].default
      })
    }
    return defaultOptions
  }

  getOptions(inputOptions?: Options): Options {
    if (!inputOptions) inputOptions = {}
    const optionsDef = this.extractor.options

    // each key in inputOptions must be defined in optionsDef
    Object.keys(inputOptions).forEach(key => {
      if (!optionsDef[key]) {
        throw 'Extractor options key not exist: ' + key
      }
    })

    return Object.assign({}, this.getDefaultOptions(), inputOptions)
  }

  extract(html: string, url: string, inputOptions?: Options) {
    if (!html) {
      throw 'html must be provided'
    }
    const options = this.getOptions(inputOptions)
    const extractor = this.extractor

    const $ = load(html, null, false)
    let title, content, contentMarkdown, excerpt, author, publishedDate, extraData = null
    const sharedData = {}

    // process $content
    const { selectors, clean, transforms, process, processElement, markdown, turndown } = extractor.content
    if (!process && !processElement) {
      throw 'Either process or processElement should be defined'
    }
    const $content = $(selectors[0]) as CheerioElement
    if (!$content || $content.length === 0) {
      throw 'No content found: ' + selectors[0]
    }

    // create state
    const state: State = {
      html,
      url,
      options,
      baseUrl: getBaseUrl(url),
      $,
      $content,
      sharedData,
    }

    // clean $content
    if (clean) {
      clean.forEach(selector => {
        $content.find(selector).remove()
      })
    }

    // Common processings
    // - remove special tags
    $content.find('style, script, noscript').remove()
    // - remove comments
    $content.contents().filter((i, el) => {
      if (el.type == ElementType.Comment) return true
      return false
    }).remove();
    // remove display: none elements
    $content.find('[style]').filter((i, el) => {
      const $el = $(el)
      if ($el.css('display') === 'none') {
        return true
      }
      return false
    }).remove();
    // - process links
    $content.find('a').each((i, el) => {
      const $el = $(el)
      // unwrap imgs in links
      const imgs = $el.find('>img')
      if (imgs.length) {
        imgs.eq(0).unwrap()
        // after unwrap, link is deleted so no further processing is needed
        return
      }
      // remove empty links
      if (!$el.text()?.trim()) {
        $el.remove()
        return
      }
      // convert relative urls to absolute urls
      $el.attr('href', getAbsUrl($el.attr('href'), state.baseUrl))
      // remove title so that it won't be rendered in markdown link
      $el.removeAttr('title')
    })
    $content.find('[src]').each((i, el) => {
      $(el).attr('src', getAbsUrl($(el).attr('src'), state.baseUrl))
    })
    // - remove class names in table
    $content.find('table').each((i, el) => {
      const $el = $(el)
      $el.removeAttr('class')
      $el.find('*').each((i, el) => {
        $(el).removeAttr('class')
      })
    })

    // transform $content
    if (transforms) {
      Object.keys(transforms).forEach(selector => {
        $content.find(selector).each((i, el) => {
          transforms[selector]($(el) as CheerioElement, state)
        })
      })
    }

    // process content
    if (process) {
      content = process($, $content, state)
    } else {
      processElement!($, $content, state)
      // get content
      content = ($content.html() || '').trim()
    }

    // initialize turndown
    let turndownOptions = this.turndownOptions
    if (turndown) {
      turndownOptions = turndown.options
    }
    const turndownService = new TurndownService(turndownOptions)
    if (turndown?.customize) {
      turndown.customize($, turndownService, state)
    }

    // get content markdown
    if (markdown) {
      contentMarkdown = markdown($, $content, turndownService, state)
    } else {
      contentMarkdown = turndownService.turndown(content)
    }

    // get title
    extractor.title.selectors.forEach(selector => {
      const text = $(selector).text().trim()
      if (text) {
        title = text
        return
      }
    })

    // get extraData
    if (extractor.extraData) {
      extraData = extractor.extraData($, state)
    }

    return {
      title,
      content,
      contentMarkdown,
      excerpt,
      author,
      publishedDate,
      extraData,
    }
  }
}

export function matchExtractor(extractor: Extractor, html: string, url: string): boolean {
  const match = extractor.match
  const matches: boolean[] = []

  // get domain from parsing url
  const domain = new URL(url).hostname

  if (match.domain) {
    if (typeof match.domain === 'string') {
      matches.push(match.domain === domain)
    } else {
      matches.push(match.domain.test(domain))
    }
  }

  if (match.url) {
    matches.push(match.url.test(url))
  }

  if (match.selectors) {
    let isSelectorsMatch = false
    const $ = load(html, null, false)
    match.selectors.forEach(selector => {
      if ($(selector).length) {
        isSelectorsMatch = true
      }
    })
    matches.push(isSelectorsMatch)
  }

  return matches.every(match => match)
}

export default ExtractManager
