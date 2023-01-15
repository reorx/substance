// Write a CLI to get the first argument as url
import ExtractManager from "./extract";
import { WikipediaExtractor } from "./extractors/wikipedia";
import axios from 'axios'

const url = process.argv[2];

if (!url) {
  console.log('please input url')
  process.exit()
}

// initialize ExtractManager
const em = new ExtractManager(WikipediaExtractor)

// fetch html from url
axios.get(url).then((res) => {
  return res.data
}).then((text) => {
  const {contentMarkdown} = em.extract(text, url)
  console.log(contentMarkdown)
})
