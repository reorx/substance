import fs from 'fs/promises';
import TurndownService from 'turndown';
import ExtractManager from './extract.js';

const formatHeading = ($node) => {
  const tag = `<${$node[0].name}>${$node.text()}</${$node[0].name}>`
  // console.log('replaceWith', tag)
  $node.replaceWith(tag)
}

const WikipediaExtractor = {
  matches: {
    domain: 'zh.wikipedia.org',
    // url: 'https://zh.wikipedia.org/.+'
    selector: '#mw-content-text',
  },
  options: {
    removeLinks: {
      help: "Remove all the links in the output",
      default: false,
    },
    getTagsFromCategories: {
      help: "Get tags from the category",
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
      '#catlinks',
    ],

    transforms: {
      'h2': $node => formatHeading($node),
      'h3': $node => formatHeading($node),
      'h4': $node => formatHeading($node),
      'h5': $node => formatHeading($node),

      '[role=note]': $node => {
        $node.replaceWith(`<blockquote>${$node.html()}</blockquote>`)
      }
    },

    postTransforms: ($, $content, sharedData) => {
      const refs = {}
      // get references
      $content.find('.references').each((i, el) => {
        const ol = $(el)
        console.log('ol', ol.html())
        ol.find('li').each((i, el) => {
          const li = $(el)
          refs[li.attr('id')] = li.html()
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

      // create a new Cheerio element to store footnotes
      const $footnotes = $('<article/>')
      $('sup.reference a').each((i, el) => {
        const a = $(el)
        // should be '#cite_note-1' but instead get 'https://...#cite_note-1
        const sp = a.attr('href').split('#')
        const refId = sp[sp.length - 1]
        // console.log('refId', refId)
        // regex get '1a' from '[1a]'
        let refName = a.text().match(/\[(.+)\]/)[1]
        // remove whitespace in refName
        refName = refName.replace(/\s/g, '')

        a.parent().replaceWith(`<sup>^${refName}</sup>`)

        $footnotes.append(`<div><sup id="${refId}">^${refName}</sup>: ${refs[refId]}</div>`)
      })
      // console.log('footnotes', $footnotes.html())

      // remove links in paragraphs
      $content.find('a').each((i, el) => {
        const a = $(el)
        a.replaceWith(a.text())
      });
      $footnotes.find('a').each((i, el) => {
        const a = $(el)
        a.replaceWith(a.text())
      });

      sharedData.$footnotes = $footnotes
    },

    markdown: ($, $content, turndownService, sharedData) => {
      const markdown = turndownService.turndown($content.html())
      // console.log(markdown)

      const footnotesMarkdown = turndownService.turndown(sharedData.$footnotes.html())
      return markdown + '\n\n' + footnotesMarkdown
    }
  },

  title: {
    selectors: [
      '#firstHeading>.mw-page-title-main',
    ],
  },

  excerpt: null,
  author: null,
  publishedDate: null,

  extraData: ($, $content, sharedData) => {
    // convert category to tags
  },

  turndown: ($) => {
    const turndownService = TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
    })
    turndownService.addRule('footnote', {
      filter: ['sup'],
      replacement: (content) => {
        return `[${content}]`
      }
    })
    return turndownService
  }
};


// main
const defaultTurndownOptions =  {
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
}
const inputFile = process.argv[2]
fs.readFile(inputFile).then(text => {
  const manager = new ExtractManager(WikipediaExtractor, defaultTurndownOptions)

  const { content, contentMarkdown, title } = manager.extract(text)
  console.log(title)

  // write html and markdown to file
  fs.writeFile(`output/${title}.html`, content)
    .then(() => console.log(`${title}.html saved to file`))
    .catch((err) => console.error(err));
  fs.writeFile(`output/${title}.md`, contentMarkdown)
    .then(() => console.log(`${title}.md saved to file`))
    .catch((err) => console.error(err));
})
