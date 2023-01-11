import { load } from "cheerio"
import { readFileSync, writeFileSync } from "fs"
import path from "path"

interface HTMLData {
  html: string
  url: string
}

const dataDir = path.join(__dirname, 'data')

export const readHTMLData = (fileprefix: string): HTMLData => {
  // read file content from filename in data/ dir
  const filepath = path.join(dataDir, `${fileprefix}.html`)
  const html = readFileSync(filepath, 'utf-8')
  const $ = load(html)
  const url = $('link[rel=canonical]').attr('href')
  if (!url) {
    throw new Error(`No canonical url found in ${filepath}`)
  }
  return {
    html,
    url,
  }
}

export const readMarkdown = (fileprefix: string): string => {
  const filepath = path.join(dataDir, `${fileprefix}.md`)
  return readFileSync(filepath, 'utf-8')
}

export const writeMarkdown = (fileprefix: string, content: string) => {
  const filepath = path.join(dataDir, `${fileprefix}.md`)
  console.log(`write to ${filepath}`)
  writeFileSync(filepath, content)
}
