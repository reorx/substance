export interface Config {
  api: {
    baseUrl: string,
  },
}

export const APP_ENV = process.env.APP_ENV || 'local'

const config: Config = require(`./${APP_ENV}`).default
console.log(`* use config of ${APP_ENV}`, config)
export default config
