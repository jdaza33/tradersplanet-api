/**
 * @description Preload the .env files
 */

//Modules
const dotenv = require('dotenv')
const { parsed: env } = dotenv.config()
const path = require('path')

const startDotenv = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { parsed: ENV } = dotenv.config({
        path: path.resolve(__dirname, '../', `.env.${env.NODE_ENV}`),
      })

      //Check ENV
      //   for (const i in ENV) {
      //     if (ENV[i] == undefined || ENV[i] == null || ENV[i] == '')
      //       return reject(`Variable ${i} is not defined or is empty`)
      //   }

      process.env = { ...process.env, ...ENV }
      return resolve({ ...ENV })
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = { startDotenv }
