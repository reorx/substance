import * as cheerio from 'cheerio';

function extract(html, extractorOptions, {
  customExtractor,
  turndownOptions,
}) {
  // extractorOptions must be the same schema as customExtractor.defaultOptions
  const options = Object.assign({}, customExtractor.defaultOptions, extractorOptions)

  const $ = cheerio.load(html, null, false)
  let title, content, contentMarkdown, excerpt, author, publishedDate, extraData = null
  const sharedData = {}

  // process $content
  const { selectors, clean, transforms, postTransforms, markdown } = customExtractor.content
  const $content = $(selectors[0])
  if ($content.length === 0) {
    throw 'No content found: ' + selectors[0]
  }
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
  content = $content.html()

  // get content markdown
  let turndownService
  if (customExtractor.turndown) {
    turndownService = customExtractor.turndown()
  } else {
    turndownService = TurndownService(turndownOptions)
  }
  if (markdown) {
    contentMarkdown = markdown($, $content, turndownService, sharedData, options)
  } else {
    contentMarkdown = turndownService.turndown(content)
  }

  // get title
  customExtractor.title.selectors.forEach(selector => {
    const text = $(selector).text().trim()
    if (text) {
      title = text
      return
    }
  })

  // get extraData
  if (customExtractor.extraData) {
    extraData = customExtractor.extraData($, $content, sharedData, options)
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

export default extract
