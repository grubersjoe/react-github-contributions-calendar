import React, { FunctionComponent, CSSProperties, HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLPreElement> & {
  style?: CSSProperties;
};

const CodeBlock: FunctionComponent<Props> = ({ children, ...props }) => (
  <pre {...props}>
    <code>{children}</code>
  </pre>
);

export default CodeBlock;
