import { Modal, ModalProps } from '@mantine/core';

import { MarkdownContent } from '@/components/MarkdownContent';


const markdown = `
Substance Web is currently restricted to use for Wikipedia URLs, specifically
[Wikipedia articles or entries](https://en.wikipedia.org/wiki/Wikipedia:What_is_an_article%3F).
Technically, You can submit any URL with \`*.wikipedia.org\` domain, but only article URLs should work.

Here are some examples that Substance has a clear unstanding about:
- \`/wiki/\` path: https://en.wikipedia.org/wiki/Feudalism
- Mobile domain: https://en.m.wikipedia.org/wiki/Feudalism
- Language (\`/zh-cn/\`) path: https://zh.wikipedia.org/zh-cn/%E5%B0%81%E5%BB%BA%E5%88%B6%E5%BA%A6_(%E6%AD%90%E6%B4%B2)
- Search params \`curid\`: https://zh.wikipedia.org/?curid=504535
- Search params \`title\`: https://zh.wikipedia.org/w/index.php?title=%E5%B0%81%E5%BB%BA%E5%88%B6%E5%BA%A6_(%E6%AD%90%E6%B4%B2)

All the above URLs should work, if you find any URL of these patterns not working,
or you know other patterns that should be identified as articles, feel free to send me feedback;
the button is at the top-right corner of the page.
`

export function HelpModal(props: ModalProps) {
  return (
    <Modal
      centered
      size="lg"
      title="Input Help"
      {...props}
    >
      <MarkdownContent markdown={markdown} />
    </Modal>
  )
}
