import { renderMarkdown } from '@/pages/Extractor/markdown';


interface MarkdownContentProps {
  markdown: string
  className?: string
}

export function MarkdownContent(props: MarkdownContentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderMarkdown(props.markdown) }}
      className={props.className || 'markdown'}
    ></div>
  )
}
