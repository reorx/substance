import { Cheerio, Element } from "cheerio";
import { Extractor } from "../extract";

const formatHeading = ($node: Cheerio<Element>) => {
  const tag = `<${$node[0].name}>${$node.text()}</${$node[0].name}>`
  // console.log('replaceWith', tag)
  $node.replaceWith(tag)
}

export const WikipediaExtractor: Extractor = {
  match: {
    url: /https:\/\/\w{2}\.wikipedia\.org\/wiki\/.+/,
    selectors: ['#mw-content-text'],
  },
  options: {
    removeLinks: {
      help: "Remove all the links in the output",
      default: false,
    },
    removeImages: {
      help: "Remove all the images as well as its captions",
      default: false,
    },
    getTagsFromCategories: {
      help: "Get tags from the categories of the wiki",
      default: false,
    }
  },

  content: {
    selectors: [
      '#mw-content-text .mw-parser-output',
    ],

    clean: [
      '#siteNotice',
      '#toc',
      '.mw-editsection',
      '.mw-jump-link',
      '.mw-cite-backlink',
      '.citation-comment',
      '.navbox',
    ],

    transforms: {
      'h2': $node => formatHeading($node),
      'h3': $node => formatHeading($node),
      'h4': $node => formatHeading($node),
      'h5': $node => formatHeading($node),

      '[role=note]': $node => {
        $node.replaceWith(`<blockquote>${$node.html()}</blockquote>`)
      },

      // thumbnail images
      '.thumbinner > a > img': ($node, state) => {
        $node.unwrap()
      },
      '.thumbcaption': $node => {
        $node.replaceWith(`<blockquote>${$node.html()}</blockquote>`)
      },
    },

    processElement: ($, $content, state) => {
      const refs: {[key: string]: string|null} = {}

      // remove images
      if (state.options.removeImages) {
        $content.find('.thumb').remove()
        $content.find('img').remove()
      }

      // get references
      const refIdPrefix = 'cite_note-'
      $content.find('.references').each((i, el) => {
        const ol = $(el)
        ol.find('li').each((i, el) => {
          const li = $(el)
          let id = li.attr('id')
          if (id) {
            // normally this is true
            if (id.startsWith(refIdPrefix)) {
              id = id.slice(refIdPrefix.length)
            }
            refs[id] = li.html()
          }
        })
        // remove the references and the heading before the references
        let topMost = ol
        const parents = ol.parentsUntil($content)
        if (parents.length > 0) {
          topMost = parents.eq(-1)
        }
        topMost.prev().remove()
        ol.remove()
      })
      // console.log('refs', refs)

      // create a new element to store footnotes
      const $footnotes = $('<article/>')
      $('sup.reference a').each((i, el) => {
        const a = $(el)
        // should be '#cite_note-1' but instead get 'https://...#cite_note-1
        const sp = a.attr('href')!.split('#')
        let refId = sp[sp.length - 1]
        refId = refId.slice(refIdPrefix.length)
        if (!refId) return
        // console.log('refId', refId)
        /* no need for this since we don't use text as before
        // regex get '1a' from '[1a]'
        const refNameMatch = a.text().match(/\[(.+)\]/)
        if (!refNameMatch) {
          return
        }
        // remove whitespace in refName
        const refName = refNameMatch[1].replace(/\s/g, '')
        */

        a.parent().replaceWith(`<sup>^${refId}</sup>`)

        $footnotes.append(`<div><sup>^${refId}</sup>: ${refs[refId]}</div>`)
      })
      state.sharedData.$footnotes = $footnotes
      // console.log('footnotes', $footnotes.html())

      if (state.options.removeLinks) {
        // remove links
        const processLink = (a: Cheerio<Element>) => {
          a.replaceWith(a.text())
        }
        $content.find('a').each((i, el) => processLink($(el)))
        $footnotes.find('a').each((i, el) => processLink($(el)))
      }
    },

    turndown:{
      options: {
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '_',
      },
      customize: ($, turndownService, state) => {
        turndownService.addRule('footnote', {
          filter: ['sup'],
          replacement: (content) => {
            return `[${content}]`
          }
        })

        // keep all tables
        turndownService.keep(function (node) {
          return node.nodeName === 'TABLE'
        })
      }
    },

    markdown: ($, $content, turndownService, state) => {
      const markdown = turndownService.turndown($content.html() || '')

      const footnotesMarkdown = turndownService.turndown(state.sharedData.$footnotes.html() || '')
      return markdown + '\n\n' + footnotesMarkdown
    },
  },

  title: {
    selectors: [
      '#firstHeading>.mw-page-title-main',
    ],
  },

  extraData: ($, state) => {
    // convert category to tags
    const extraData: {[key: string]: any} = {}
    let tags: string[] = []
    if (state.options.getTagsFromCategories) {
      $('#mw-normal-catlinks li a').each((i, el) => {
        const tag = $(el).text()?.trim()
        if (tag) tags.push(tag)
      })
      extraData.tags = tags
    }
    return extraData
  },
};
