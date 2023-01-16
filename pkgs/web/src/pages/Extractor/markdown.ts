import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
})
md.use(require('markdown-it-footnote'))
md.use(require('markdown-it-anchor').default, {
})

export function renderMarkdown(text: string) {
  return md.render(text)
}
