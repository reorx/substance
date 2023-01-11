import {load, CheerioAPI, Cheerio, AnyNode, Element as CheerioElement } from 'cheerio';
import TurndownService from 'turndown';

export interface OptionsDef {
  [key: string]: {
    help: string
    default: any
  }
}
export interface Options {
  [key: string]: any
}
type Node = Cheerio<AnyNode>
type Element = Cheerio<CheerioElement>
export interface State {
  html: string
  url: string
  options: Options
  $: CheerioAPI
  $content: Element
  sharedData: any
}
export interface PropertyHandler {
  selectors: string[]
  process?: ($: CheerioAPI, $el: Element, state: State) => string
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
  matches: {
    domain?: string|RegExp
    url?: string|RegExp
    selectors?: string[]
  }
  options: OptionsDef
  content: {
    selectors: string[]
    clean: string[]
    transforms: {
      [selector: string]: ($el: Element, state: State) => void
    }
    processElement?: ($: CheerioAPI, $el: Element, state: State) => void
    process?: ($: CheerioAPI, $el: Element, state: State) => string
    turndown?: {
      options: TurndownService.Options
      customize?: ($: CheerioAPI, turndownService: TurndownService, state: State) => void
    }
    markdown?: ($: CheerioAPI, $el: Element, turndownService: TurndownService, state: State) => string
  }
  title: PropertyHandler
  excerpt?: PropertyHandler
  author?: PropertyHandler
  publishedDate?: PropertyHandler
  extraData: ($: CheerioAPI, state: State) => any
}


// create a class called ExtractorManager, the constructor takes a extractor object
class ExtractorManager {
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

    return Object.assign({}, inputOptions, this.getDefaultOptions())
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
    const $content = $(selectors[0]) as Element
    if (!$content || $content.length === 0) {
      throw 'No content found: ' + selectors[0]
    }

    // create state
    const state: State = {
      html,
      url,
      options,
      $,
      $content,
      sharedData,
    }

    // remove comments
    $content.contents().filter(function() {
      return this.type === 'comment'
    }).remove();

    if (clean) {
      clean.forEach(selector => {
        $content.find(selector).remove()
      })
    }
    if (transforms) {
      Object.keys(transforms).forEach(selector => {
        $content.find(selector).each((i, el) => {
          transforms[selector]($(el) as Element, state)
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

export default ExtractorManager
