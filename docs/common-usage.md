# `@substancejs/common` Developer Guide

## 1. What this package provides

`@substancejs/common` is the shared extraction core in this monorepo.

Main capabilities:

- HTML to Markdown extraction framework (`ExtractManager`)
- Built-in Wikipedia extractor rules
- Metadata extraction helper for browser pages
- Reusable Markdown editor/viewer React components and shared state store

## 2. Install and import

In this monorepo, use workspace dependency:

```json
{
  "dependencies": {
    "@substancejs/common": "^1.0.0"
  }
}
```

Typical imports:

```ts
import ExtractManager, { matchExtractor, type Extractor, type Options } from '@substancejs/common/extract'
import { WikipediaExtractor } from '@substancejs/common/extractors/wikipedia'
import { getMeta } from '@substancejs/common/metadata'
import { renderMarkdown } from '@substancejs/common/markdown'
import { MarkdownEditor } from '@substancejs/common/components/MarkdownEditor'
import { Viewer as MarkdownViewer } from '@substancejs/common/components/MarkdownViewer'
import { useMarkdownStore } from '@substancejs/common/components/stores'
```

Note:

- Package root (`@substancejs/common`) currently re-exports `extract.ts` only.
- For metadata/components/markdown helpers, use subpath imports.

## 3. Core extraction API

## 3.1 `ExtractManager`

Constructor:

```ts
new ExtractManager(extractor: Extractor, turndownOptions?: TurndownService.Options)
```

Methods:

- `getDefaultOptions(): Options`
- `getOptions(inputOptions?: Options): Options`
- `extract(html: string, url: string, inputOptions?: Options): ExtractResult`

Behavior details:

- `extract` throws if `html` is empty.
- `extract` throws if neither `content.process` nor `content.processElement` is defined.
- `extract` uses `content.selectors[0]` as the main content root.
- Unknown `inputOptions` keys throw (`Extractor options key not exist: <key>`).
- Return value includes:
  - `title`
  - `content` (processed HTML)
  - `contentMarkdown`
  - `excerpt`
  - `author`
  - `publishedDate`
  - `extraData`

## 3.2 `matchExtractor`

```ts
matchExtractor(extractor: Extractor, html: string, url: string): boolean
```

It validates `extractor.match`:

- `domain` must match if provided
- `url` RegExp must match if provided
- at least one `selectors` item must exist in HTML if provided
- all provided conditions must pass

## 3.3 `Extractor` contract (important fields)

Required top-level fields:

- `match`
- `options`
- `content`
- `title`
- `extraData`

`content` key points:

- `selectors`: candidate roots; extraction currently uses the first one
- `clean`: selectors to remove before processing
- `transforms`: selector-based DOM transforms
- `process` or `processElement`: at least one required
- `turndown`: markdown conversion options and custom rules
- `markdown`: custom markdown output logic

## 4. Built-in Wikipedia extractor

Use:

```ts
import { WikipediaExtractor } from '@substancejs/common/extractors/wikipedia'
```

Match rule:

- URL must match `https://*.wikipedia.org/*`
- page must contain `#mw-content-text`

Supported options:

- `removeLinks` (default `false`)
- `removeImages` (default `false`)
- `removeTables` (default `false`)
- `keepFigureImage` (default `false`)
- `getTagsFromCategories` (default `false`)

## 5. Usage examples

## 5.1 Basic extraction (Node / TS)

```ts
import axios from 'axios'
import ExtractManager from '@substancejs/common/extract'
import { WikipediaExtractor } from '@substancejs/common/extractors/wikipedia'

const em = new ExtractManager(WikipediaExtractor)
const url = 'https://en.wikipedia.org/wiki/Feudalism'

async function run() {
  const html = (await axios.get(url)).data
  const result = em.extract(html, url, {
    removeLinks: false,
    removeImages: true,
  })

  console.log(result.title)
  console.log(result.contentMarkdown.slice(0, 400))
  console.log(result.extraData)
}

run()
```

## 5.2 Match before extract

```ts
import { matchExtractor } from '@substancejs/common/extract'
import { WikipediaExtractor } from '@substancejs/common/extractors/wikipedia'

const canUse = matchExtractor(WikipediaExtractor, html, url)
if (!canUse) {
  throw new Error('WikipediaExtractor does not match this page')
}
```

## 5.3 Define your own extractor

```ts
import { load } from 'cheerio'
import ExtractManager, { type Extractor } from '@substancejs/common/extract'

const DemoExtractor: Extractor = {
  match: {
    domain: 'example.com',
    selectors: ['article.post'],
  },
  options: {
    removeLinks: { help: 'Remove all links', default: false },
  },
  content: {
    selectors: ['article.post'],
    clean: ['.ads', '.related'],
    transforms: {
      'h2': ($el) => {
        $el.replaceWith(`<h2>${$el.text()}</h2>`)
      },
    },
    processElement: ($, $content, state) => {
      if (state.options.removeLinks) {
        $content.find('a').each((_, el) => {
          const a = $(el)
          a.replaceWith(a.text())
        })
      }
    },
    turndown: {
      options: { headingStyle: 'atx', codeBlockStyle: 'fenced' },
    },
  },
  title: {
    selectors: ['h1.post-title', 'title'],
  },
  extraData: ($) => {
    return {
      tags: $('.tag-list a').map((_, el) => $(el).text().trim()).get(),
    }
  },
}

const em = new ExtractManager(DemoExtractor)
const result = em.extract(html, 'https://example.com/post/1', { removeLinks: true })
console.log(result.contentMarkdown)
```

## 5.4 Use shared editor/viewer in React

```tsx
import React from 'react'
import { MarkdownEditor } from '@substancejs/common/components/MarkdownEditor'
import { Viewer as MarkdownViewer } from '@substancejs/common/components/MarkdownViewer'
import { useMarkdownStore } from '@substancejs/common/components/stores'

export default function ExtractorPage() {
  const setState = useMarkdownStore.setState

  React.useEffect(() => {
    setState({
      url: 'https://en.wikipedia.org/wiki/Feudalism',
      title: 'Feudalism',
      contentMarkdown: '# Demo',
      extraData: { source: 'manual' },
    })
  }, [])

  return (
    <>
      <MarkdownEditor />
      <MarkdownViewer />
    </>
  )
}
```

## 5.5 Extract metadata from browser page

```ts
import { getMeta } from '@substancejs/common/metadata'

const meta = getMeta(document, location.href)
console.log(meta.title, meta.description, meta.author, meta.date, meta.url)
```

`MetaData` shape:

```ts
interface MetaData {
  title: string
  author: string
  description: string
  url: string
  date: string
}
```

## 6. Common pitfalls

- Always pass the real page URL to `extract`; relative link normalization depends on it.
- Do not pass unknown option keys; validation will throw.
- If extraction returns empty content, inspect `content.selectors[0]` first.
- In custom extractors, define either `process` or `processElement` (or both).
- Current implementation throws string errors, not `Error` objects.

## 7. Recommended local verification

```bash
pnpm --filter @substancejs/common test
pnpm --filter @substancejs/common cli -- https://en.wikipedia.org/wiki/Feudalism
```
