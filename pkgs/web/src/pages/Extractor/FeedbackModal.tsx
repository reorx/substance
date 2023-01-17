import { Modal, ModalProps } from '@mantine/core';

import { MarkdownContent } from '@/components/MarkdownContent';


const markdown = `
If you have any suggestions or have encountered any errors, please send me your feedback.

It is recommended to create issues on GitHub:
- [Click here to create a bug report](https://github.com/reorx/substance/issues/new?assignees=&labels=&template=bug-report.md&title=)
- [Click here to create a feature request](https://github.com/reorx/substance/issues/new?assignees=&labels=&template=feature_request.md&title=)

You can also join the [Discord server](https://discord.gg/GKFu7DVZ) to chat with me,
or email me via [hello@reorx.com](mailto:hello@reorx.com).

If you find this project useful, consider supporting it by buying me a coffee through
[GitHub Sponsors](https://github.com/sponsors/reorx) or [Ko-fi](https://ko-fi.com/reorx).

Sincerely<br>
[Reorx](https://reorx.com)
`

export function FeedbackModal(props: ModalProps) {
  return (
    <Modal
      centered
      size="lg"
      title="Hello there :)"
      {...props}
    >
      <MarkdownContent markdown={markdown} />
    </Modal>
  )
}
