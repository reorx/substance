// https://github.com/jantimon/html-webpack-plugin

const title = 'Substance'
const description = 'Extract substance from the web'
const url = 'https://substance.reorx.com'
const image_url = '/cover.png'

module.exports = {
  favicon: './public/favicon.svg',
  title,
  meta: {
    'title': {
      name: 'title',
      content: title,
    },
    'description': {
      name: 'description',
      content: description,
    },

    // opengraph
    'og:title': {
      property: 'og:title',
      content: title,
    },
    'og:description': {
      property: 'og:description',
      content: description,
    },
    'og:url': {
      property: 'og:url',
      content: url,
    },
    'og:image': {
      property: 'og:image',
      content: image_url,
    },
    'og:type': {
      property: 'og:type',
      content: 'website'
    },

    // twitter
    'twitter:card': {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    'twitter:image': {
      property: 'twitter:image',
      content: image_url,
    }
  }
}
