/**
 * @description Utilidad para el manejo de respuestas
 */

'use strict'

// Modules
const paginate = require('express-paginate')
const mongoose = require('mongoose')
const qs = require('query-to-json')

//Constantes
let listResponses = require('./constants/response.const.json')

module.exports = {
  getResponse,
  responsePaginate,
}

/**
 * @description Esta funcion busca en el json response.const.json y retorna la coincidencia
 * @param {Codigo de respuesta} code
 * @param {ISO del lenguaje} iso
 */
function getResponse(code, iso = process.env.ISO) {
  let message = ''

  let response = listResponses.find((res) => res.code == code)

  let msjRes = response.message.find((msj) => msj.iso == iso)
  if (msjRes && msjRes.text) message = msjRes.text

  return message
}

/**
 *
 * @param {*} req
 * @param {nombre del esquema} model
 * @param {filtros para buscar y contar} filters
 * @param {Tipo de sliders si se da el caso} typeSlider
 * @param {Si la busqueda de mongoose es tipo aggregate o no} isAggregate
 */
function responsePaginate(
  req,
  model,
  filters = {},
  typeSlider = '',
  isAggregate = false
) {
  return new Promise(async (resolve, reject) => {
    try {
      let totalData = 0

      if (isAggregate) {
        let tmpdata = await mongo_native
          .collection(model.toLowerCase())
          .aggregate(filters)
          .toArray()
        totalData = tmpdata.length
      } else {
        totalData = await mongoose.model(model).count(filters)
      }

      let pageCount = Math.ceil(totalData / req.query.limit)

      let infoPages = paginate.getArrayPages(req)(
        1,
        pageCount || 1,
        req.query.page
      )[0]
      infoPages = JSON.stringify(infoPages)
      infoPages = JSON.parse(infoPages)

      let actualPage = infoPages.number
      let hasMore = paginate.hasNextPages(req)(pageCount)
      let nextPage
      let previousPage

      let temp = infoPages.url.split(`page=${infoPages.number}`)
      let beforeQuery = temp[0].split('?')[0]
      let query = req.query

      if (hasMore) {
        let tmpQuery = { ...query }
        tmpQuery.page = infoPages.number + 1
        if (typeSlider || typeSlider != '') tmpQuery.slider = typeSlider
        nextPage = {
          page: infoPages.number + 1,
          url: `${beforeQuery}${qs.jsonToQuery(tmpQuery)}`,
        }
      }
      if (actualPage > 1) {
        let tmpQuery = { ...query }
        tmpQuery.page = infoPages.number - 1
        if (typeSlider || typeSlider != '') tmpQuery.slider = typeSlider
        previousPage = {
          page: infoPages.number - 1,
          url: `${beforeQuery}${qs.jsonToQuery(tmpQuery)}`,
        }
      }
      resolve({
        hasMore,
        totalData,
        actualPage,
        nextPage,
        previousPage,
      })
    } catch (error) {
      console.error('Error al obtener json de paginate')
      reject(error)
    }
  })
}
