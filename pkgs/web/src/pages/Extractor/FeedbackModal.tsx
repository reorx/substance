import { Modal, ModalProps } from '@mantine/core';


export function FeedbackModal(props: ModalProps) {
  return (
    <Modal
      centered
      size="lg"
      title="Hello there :)"
      {...props}
    >
      <p>If you have any suggestions or have encountered any errors, please send me your feedback.</p>

      <p>It is recommended to to create issues on GitHub:</p>
      <ul>
        <li><a href="https://github.com/reorx/substance/issues/new?assignees=&labels=&template=bug-report.md&title=" target="_blank">Click here to create a bug report</a></li>
        <li><a href="https://github.com/reorx/substance/issues/new?assignees=&labels=&template=feature_request.md&title=" target="_blank">Click here to create a feature request</a></li>
      </ul>

      <p>However, you are welcomed to send me a message via <a href="mailto:hello@reorx.com">hello@reorx.com</a></p>

      <p>P.S. if you find this project useful, consider buy me a coffee
      </p>
      <p>Also, if you find this project useful, consider supporting it by buying me a coffee through
        {" "}<a href="https://github.com/sponsors/reorx" target="_blank">GitHub Sponsors</a> or
        {" "}<a href="https://ko-fi.com/reorx" target="_blank">Ko-fi</a>
      </p>

      <p>
        Sincerely<br/>
        <a href="https://reorx.com" target="_blank">Reorx</a>
      </p>
    </Modal>
  )
}
