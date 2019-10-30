/**
 * @description Utilidad para el manejo de respuestas
 */

'use strict'

// Modules
require('dotenv').config()

//Constantes
let listResponses = require('./constants/response.const.json')

module.exports = {
  getResponse
}

/**
 * @description Esta funcion busca en el json response.const.json y retorna la coincidencia
 * @param {Codigo de respuesta} code
 * @param {ISO del lenguaje} iso
 */
function getResponse(code, iso = process.env.ISO) {
  let message = ''

  let response = listResponses.find(res => res.code == code)

  if (response && response.message && response.message.lenth > 0) {
    let msjRes = response.message.find(msj => msj.iso == iso)
    if (msjRes && msjRes.text) message = msjRes.text
  }

  return message
}
