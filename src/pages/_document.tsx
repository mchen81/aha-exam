import React from 'react'
import { type DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import {
  documentGetInitialProps,
  DocumentHeadTags,
  type DocumentHeadTagsProps
} from '@mui/material-nextjs/v13-pagesRouter'
import { type DocumentProps } from 'postcss'

export default function Document (props: DocumentProps & DocumentHeadTagsProps): React.JSX.Element {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  )
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  return await documentGetInitialProps(ctx)
}
