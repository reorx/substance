import MarkdownIt from 'markdown-it';


const md = new MarkdownIt({
  html: true,
  linkify: true,
})
md.use(require('markdown-it-footnote'))
md.use(require('markdown-it-anchor').default, {
})
md.use(require("markdown-it-link-attributes"), {
  attrs: {
    target: "_blank"
  }
})

export function renderMarkdown(text: string) {
  return md.render(text)
}
