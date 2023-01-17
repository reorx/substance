import {
  Cheerio,
  Element,
} from 'cheerio';

import { Extractor } from '../extract';

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
    useFigureForImage: {
      help: "Use <figure> for images, so that the caption can be rendered correctly. Note that images will be represented in <img> rather than markdown syntax, this may not be suitable for all the markdown renderers",
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
      '.magnify',  // .thumbcaption > .magnify
      '.side-box', '.sister-box',
      '.ambox',  // article message box
    ],

    transforms: {
      'h2': $node => formatHeading($node),
      'h3': $node => formatHeading($node),
      'h4': $node => formatHeading($node),
      'h5': $node => formatHeading($node),

      '[role=note]': $node => {
        $node.replaceWith(`<blockquote>${$node.html()}</blockquote>`)
      },

      // images
      '.thumbinner': ($node, state) => {
        if (state.options.useFigureForImage) {
          $node.replaceWith(`<figure>${$node.html()}</figure>`)
        }
      },
      '.thumbcaption': ($node, state) => {
        if (state.options.useFigureForImage) {
          $node.replaceWith(`<figcaption>${$node.html()}</figcaption>`)
        } else {
          $node.replaceWith(`<blockquote>${$node.html()}</blockquote>`)
        }
      },
    },

    processElement: ($, $content, state) => {
      // remove images
      if (state.options.removeImages) {
        $content.find('.thumb').remove()
        $content.find('img').remove()
      }

      // get references
      const refsMap: {[key: string]: string|null} = {}
      const refIdPrefix = 'cite_note-'
      const getRefId = (name: string) => {
        // normally this is true
        if (name.startsWith(refIdPrefix)) {
          return name.slice(refIdPrefix.length)
        }
        return name
      }
      // process inline footnote refs (even in .references!)
      $('sup.reference a').each((i, el) => {
        const a = $(el)
        // url is relative anchor here: #cite_note-1
        const refId = getRefId(a.attr('href')!.slice(1))
        if (!refId) return

        a.parent().replaceWith(`<sup>^${refId}</sup>`)
      })
      // create a new element to store footnotes
      const $footnotes = $('<article/>')
      // travese through each .references block
      $content.find('.references').each((i, el) => {
        const ol = $(el)
        ol.find('li').each((i, el) => {
          const li = $(el)
          let id = li.attr('id')
          if (!id) return

          const refId = getRefId(id)
          refsMap[refId] = li.find('.reference-text').html()
          $footnotes.append(`<div><sup>^${refId}</sup>: ${refsMap[refId]}</div>`)
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

        // keep figure
        turndownService.keep(node => {
          return node.nodeName == 'FIGURE'
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
      return markdown + '\n\n\n' + footnotesMarkdown
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
