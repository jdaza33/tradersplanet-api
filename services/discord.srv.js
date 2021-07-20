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

const addToChannel = (userId, isValidate = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { discordId, discordTokens } = await User.findOne(
        { _id: userId },
        { discordId: 1, discordTokens: 1 }
      ).lean()

      if (!discordId) {
        if (isValidate)
          return reject('El usuario aun no esta enlazado con Discord')
        else return resolve(false)
      }

      let { data } = await axios({
        method: 'put',
        url: `${process.env.URL_API_DISCORD}/v8/guilds/${process.env.DISCORD_GUILD}/members/${discordId}`,
        headers: {
          authorization: `Bot ${process.env.BOT_DISCORD}`,
        },
        data: {
          access_token: discordTokens.access,
        },
      })

      return resolve(data)
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = {
  getToken,
  getUser,
  saveUserDiscord,
  addToChannel,
}
