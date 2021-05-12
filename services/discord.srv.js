/**
 * @description Servicio de discord
 */

//Modules
const axios = require('axios').default
const qs = require('qs')

//Models
const User = require('../models/user')

/**
 * @description Obtenemos los tokens de autorizacion dado el codigo
 * @param {string} code
 * @returns
 */
const getToken = (code) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { data } = await axios({
        method: 'post',
        url: `${process.env.URL_API_DISCORD}/v8/oauth2/token`,
        data: qs.stringify({
          client_id: process.env.CLIENT_ID_DISCORD,
          client_secret: process.env.CLIENT_SECRET_DISCORD,
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.REDIRECT_URI_DISCORD,
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })

      return resolve(data)
    } catch (error) {
      return reject(error)
    }
  })
}

const getUser = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { data } = await axios({
        method: 'get',
        url: `${process.env.URL_API_DISCORD}/v8/users/@me`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      return resolve(data)
    } catch (error) {
      return reject(error)
    }
  })
}

const saveUserDiscord = (
  userId,
  discordId,
  access_token,
  refresh_token,
  exp_token
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            discordId,
            'discordTokens.access': access_token,
            'discordTokens.refresh': refresh_token,
            'discordTokens.exp': exp_token,
          },
        },
        { new: true }
      )

      return resolve(user)
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = {
  getToken,
  getUser,
  saveUserDiscord,
}
