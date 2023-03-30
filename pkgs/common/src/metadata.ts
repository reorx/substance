export interface MetaData {
  title: string
  author: string
  description: string
  url: string
  date: string
}

export const getMeta = (document: Document, url: string): MetaData => {
  const data: any = {}

  for (let key in metascraperRules) {
    const rules = metascraperRules[key]

    // get data[key] from rules
    for (let rule of rules) {
      const v = rule.getValue(document)
      if (v) {
        data[key] = v
        break
      }
    }

    // ensure data[key] is not undefined
    if (data[key] === undefined) {
      data[key] = ''
    }
  }

  return data
}

/* Below is ported from metascraper */
// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-helpers/index.js

class Rule {
  selector: string
  attrKey?: string
  postProcessor?: (v: string) => string

  constructor(selector: string) {
    this.selector = selector
  }

  attr(v: string) {
    this.attrKey = v
    return this
  }

  addPostProcessor(fn: (v: string) => string) {
    this.postProcessor = fn
    return this
  }

  getValue(document: Document): string | undefined {
    const el = document.querySelector(this.selector)
    if (!el) return ''
    let v: string | undefined
    if (this.attrKey) {
      // get attribute
      v = el.getAttribute(this.attrKey)?.trim()
    } else {
      // get content
      v = el.textContent?.trim()
    }

    if (this.postProcessor !== undefined && v) {
      v = this.postProcessor(v)
    }
    return v
  }
}

function cash(selector: string): Rule {
  return new Rule(selector)
}

type cashFunc = (selector: string) => Rule

type cashCallback = (fn: cashFunc) => Rule

const toRule = (callback: cashCallback): Rule => {
  return callback(cash)
}

const toDescription = toRule
const toTitle = toRule
const toAuthor = toRule
const toDate = toRule
const toUrl = (callback: cashCallback): Rule => {
  return toRule(callback).addPostProcessor((url) => {
    // remove url fragment
    return url.split('#')[0]
  })
}

/*
Selector spec:
https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors

Rules reference:
- itemprop:
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemprop
  - https://schema.org/docs/gs.html#microdata_itemprop
*/

const metascraperRules: { [key: string]: Rule[] } = {
  // https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-description/index.js
  description: [
    toDescription(($) => $('meta[property="og:description"]').attr('content')),
    toDescription(($) => $('meta[name="twitter:description"]').attr('content')),
    toDescription(($) => $('meta[property="twitter:description"]').attr('content')),
    toDescription(($) => $('meta[name="description"]').attr('content')),
    toDescription(($) => $('meta[itemprop="description"]').attr('content')),
    // TODO implement later
    // toDescription($jsonld('articleBody')),
    // toDescription($jsonld('description'))
  ],

  // https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
  title: [
    toTitle(($) => $('meta[property="og:title"]').attr('content')),
    toTitle(($) => $('meta[name="twitter:title"]').attr('content')),
    toTitle(($) => $('meta[property="twitter:title"]').attr('content')),
    // Duplicate with readability.js
    // toTitle($ => $filter($, $('title'))),
    // toTitle($jsonld('headline')),
    // toTitle($ => $filter($, $('.post-title'))),
    // toTitle($ => $filter($, $('.entry-title'))),
    // toTitle($ => $filter($, $('h1[class*="title" i] a'))),
    // toTitle($ => $filter($, $('h1[class*="title" i]')))
  ],

  // https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js
  author: [
    // toAuthor($jsonld('author.name')),
    // toAuthor($jsonld('brand.name')),
    toAuthor(($) => $('meta[name="author"]').attr('content')),
    toAuthor(($) => $('meta[property="article:author"]').attr('content')),
    // TODO implement later
    // toAuthor($ => $filter($, $('[itemprop*="author" i] [itemprop="name"]'))),
    // toAuthor($ => $filter($, $('[itemprop*="author" i]'))),
    // toAuthor($ => $filter($, $('[rel="author"]'))),
    // strict(toAuthor($ => $filter($, $('a[class*="author" i]')))),
    // strict(toAuthor($ => $filter($, $('[class*="author" i] a')))),
    // strict(toAuthor($ => $filter($, $('a[href*="/author/" i]')))),
    // toAuthor($ => $filter($, $('a[class*="screenname" i]'))),
    // strict(toAuthor($ => $filter($, $('[class*="author" i]')))),
    // strict(
    //   toAuthor($ =>
    //     $filter($, $('[class*="byline" i]'), el => {
    //       const value = $filter.fn(el)
    //       return !date(value) && value
    //     })
    //   )
    // )
  ],

  // https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js
  date: [
    // toDate($jsonld('dateModified')),
    // toDate($jsonld('datePublished')),
    // toDate($jsonld('dateCreated')),
    toDate(($) => $('meta[property*="updated_time" i]').attr('content')),
    toDate(($) => $('meta[property*="modified_time" i]').attr('content')),
    toDate(($) => $('meta[property*="published_time" i]').attr('content')),
    toDate(($) => $('meta[property*="release_date" i]').attr('content')),
    toDate(($) => $('meta[name="date" i]').attr('content')),
    toDate(($) => $('[itemprop*="datemodified" i]').attr('content')),
    toDate(($) => $('[itemprop="datepublished" i]').attr('content')),
    toDate(($) => $('[itemprop*="date" i]').attr('content')),
    toDate(($) => $('time[itemprop*="date" i]').attr('datetime')),
    toDate(($) => $('time[datetime]').attr('datetime')),
    toDate(($) => $('time[datetime][pubdate]').attr('datetime')),
    toDate(($) => $('meta[name*="dc.date" i]').attr('content')),
    toDate(($) => $('meta[name*="dc.date.issued" i]').attr('content')),
    toDate(($) => $('meta[name*="dc.date.created" i]').attr('content')),
    toDate(($) => $('meta[name*="dcterms.date" i]').attr('content')),
    toDate(($) => $('[property*="dc:date" i]').attr('content')),
    toDate(($) => $('[property*="dc:created" i]').attr('content')),
    // toDate($ => $filter($, $('[class*="byline" i]'))),
    // toDate($ => $filter($, $('[class*="dateline" i]'))),
    // toDate($ => $filter($, $('[id*="metadata" i]'))),
    // toDate($ => $filter($, $('[class*="metadata" i]'))), // twitter, move into a bundle of rules
    // toDate($ => $filter($, $('[id*="date" i]'))),
    // toDate($ => $filter($, $('[class*="date" i]'))),
    // toDate($ => $filter($, $('[id*="publish" i]'))),
    // toDate($ => $filter($, $('[class*="publish" i]'))),
    // toDate($ => $filter($, $('[id*="post-timestamp" i]'))),
    // toDate($ => $filter($, $('[class*="post-timestamp" i]'))),
    // toDate($ => $filter($, $('[id*="post-meta" i]'))),
    // toDate($ => $filter($, $('[class*="post-meta" i]'))),
    // toDate($ => $filter($, $('[id*="time" i]'))),
    // toDate($ => $filter($, $('[class*="time" i]')))

    /* my rules */
    // mp.weixin.qq.com
    toDate(($) => $('#publish_time')),
  ],

  // https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js
  url: [
    toUrl(($) => $('meta[property="og:url"]').attr('content')),
    toUrl(($) => $('meta[itemprop="url"]').attr('content')),
    toUrl(($) => $('meta[name="twitter:url"]').attr('content')),
    toUrl(($) => $('meta[property="twitter:url"]').attr('content')),
    toUrl(($) => $('link[rel="canonical"]').attr('href')),
    toUrl(($) => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
    // ({ url }) => url
  ],
}
