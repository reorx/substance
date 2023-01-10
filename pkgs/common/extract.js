import * as cheerio from 'cheerio';


// create a class called ExtractorManager, the constructor takes a extractor object
class ExtractorManager {
  constructor(extractor, turndownOptions) {
    this.extractor = extractor;
    this.turndownOptions = turndownOptions
  }

  getDefaultOptions() {
    const optionsDef = this.extractor.options
    const defaultOptions = {}

    if (optionsDef) {
      Object.keys(optionsDef).forEach(key => {
        defaultOptions[key] = optionsDef[key].default
      })
    }
    return defaultOptions
  }

  getOptions(inputOptions) {
    const optionsDef = this.extractor.options

    // each key in inputOptions must be defined in optionsDef
    Object.keys(inputOptions).forEach(key => {
      if (!optionsDef[key]) {
        throw 'Extractor options key not exist: ' + key
      }
    })

    return Object.assign({}, inputOptions, this.getDefaultOptions())
  }

  extract(html, url, inputOptions) {
    if (!html) {
      throw 'html must be provided'
    }
    const options = this.getOptions(inputOptions || {})
    const extractor = this.extractor

    const $ = cheerio.load(html, null, false)
    let title, content, contentMarkdown, excerpt, author, publishedDate, extraData = null
    const sharedData = {}

    // process $content
    const { selectors, clean, transforms, postTransforms, markdown } = extractor.content
    const $content = $(selectors[0])
    if ($content.length === 0) {
      throw 'No content found: ' + selectors[0]
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
          transforms[selector]($(el))
        })
      })
    }

    // post transforms
    if (postTransforms) {
      postTransforms($, $content, sharedData, options)
    }

    // get content
    content = $content.html().trim()

    // get content markdown
    let turndownService
    if (extractor.turndown) {
      turndownService = extractor.turndown()
    } else {
      turndownService = TurndownService(turndownOptions)
    }
    if (markdown) {
      contentMarkdown = markdown($, $content, turndownService, sharedData, options)
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
      extraData = extractor.extraData($, $content, sharedData, options)
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
