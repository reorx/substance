import { load } from "cheerio"
import { readFileSync, writeFileSync } from "fs"
import path from "path"


export interface SourceData {
  html: string
  url: string
}

export class DataManager {
  name: string
  dirpath: string
  sourcepath: string

  constructor(name: string) {
    this.name = name
    this.dirpath = path.join(__dirname, 'data', name)
    this.sourcepath = path.join(this.dirpath, 'source.html')
  }

  getSource(): SourceData {
    const html = readFileSync(this.sourcepath, 'utf-8')
    const $ = load(html)
    const url = $('link[rel=canonical]').attr('href')
    if (!url) {
      throw new Error(`No canonical url found in ${this.sourcepath}`)
    }
    return {
      html,
      url,
    }
  }

  resultPath(variant: string|null, ext: string): string {
    const filename = `result${variant ? `.${variant}` : ''}.${ext}`
    return path.join(this.dirpath, filename)
  }

  getResult(variant: string|null, ext: string): string {
    const resultpath = this.resultPath(variant, ext)
    return readFileSync(resultpath, 'utf-8')
  }

  saveResult(variant: string|null, ext: string, content: string) {
    const resultpath = this.resultPath(variant, ext)
    console.log(`write to ${resultpath}`)
    writeFileSync(resultpath, content)
  }
}
