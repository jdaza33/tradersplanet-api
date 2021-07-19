/**
 * @description Controlador para discord
 */

'use strict'

//Modules
const mongoose = require('mongoose')
const path = require('path')

//Utils
const _util_response = require('../utils/response.util')

//Services
const {
  getToken,
  getUser,
  saveUserDiscord,
  addToChannel,
} = require('../services/discord.srv')

const { checkPaymentsUser } = require('../services/payments.srv')

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function test(req, res, next) {
  try {
    console.log('body', req.body)
    console.log('params', req.params)
    console.log('query', req.query)

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @api {get} /discord/get-auth/ Obtener el enlace de autorizacion a discord y redirigir
 * @apiName GetUrlAuth
 * @apiGroup Discord
 * @apiDescription Servicio para redirigir al usuario a la plataforma de discord para que apruebe la autorizacion de Tplanet
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} authorization Bearer {token}
 * @apiHeader {String} iso Lenguaje del usuario, por defecto = "es"
 *
 * @apiParam {Number} userId El id del usuario (query params)
 *
 */
async function getUrlAuth(req, res, next) {
  try {
    let { userId } = req.query
    console.log(req.query)

    if (!userId || userId == '') return next('El campo userId es requerido')

    let url = `${process.env.URL_ACCESS_DISCORD}&state=${userId}`
    // url = url.replace('burib', redirect_url)

    return res.redirect(url)
  } catch (error) {
    next(error)
  }
}

async function auth(req, res, next) {
  try {
    let { code, state: userId } = req.query
    console.log(req.query)

    //Obtenemos los tokens
    let { access_token, expires_in, refresh_token } = await getToken(code)

    //Obtenemos los datos del usuario
    let { id: discordId } = await getUser(access_token)
    let exp = Date.now() + expires_in

    //Almacenamos la informacion
    await saveUserDiscord(userId, discordId, access_token, refresh_token, exp)

    //Verificamos si tiene una suscripcion
    const { active: subUserActive } = await checkPaymentsUser(userId)

    if (subUserActive) await addToChannel()

    path.join(path.resolve(__dirname, '../'), 'views/success-auth.html')
    res.sendFile(
      path.join(path.resolve(__dirname, '../'), 'views/success-auth.html')
    )

    // return res.status(200).send({
    //   success: 1,
    //   error: null,
    // })
  } catch (error) {
    res.sendFile(
      path.join(path.resolve(__dirname, '../'), 'views/error-auth.html')
    )
    // next(error)
  }
}

module.exports = {
  test,
  getUrlAuth,
  auth,
}
