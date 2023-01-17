// https://github.com/jantimon/html-webpack-plugin

const title = 'Substance'
const description = 'Extract substance from the web'
const url = 'https://substance.reorx.com'
const image_url = url + '/cover.png'

const meta_tags = [
    {
      name: 'title',
      content: title,
    },
    {
      name: 'description',
      content: description,
    },

    // opengraph
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:url',
      content: url,
    },
    {
      property: 'og:image',
      content: image_url,
    },
    {
      property: 'og:type',
      content: 'website'
    },

    // twitter
    {
      name: 'twitter:card',
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:image',
      property: 'twitter:image',
      content: image_url,
    },
    {
      name: 'twitter:creator',
      property: 'twitter:creator',
      content: '@novoreorx',
    },
    {
      name: 'twitter:title',
      property: 'twitter:title',
      content: title,
    },
    {
      name: 'twitter:description',
      property: 'twitter:description',
      content: description,
    },
]

const meta = {}
meta_tags.forEach(o => {
  meta[o.name || o.property] = o
})

module.exports = {
  favicon: './public/favicon.svg',
  title,
  meta,
}
