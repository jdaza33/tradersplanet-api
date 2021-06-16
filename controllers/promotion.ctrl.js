/**
 * @description Controlador para el crud de promociones
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Promotion = require('../models/promotion')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  create,
  list,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function create(req, res, next) {
  try {
    let data = req.body

    data.createdAt = Date.now()

    let promotionCreated = await Promotion.create(data)

    return res.status(200).send({
      success: 1,
      data: { promotion: promotionCreated },
      error: null,
      message: _util_response.getResponse(70, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
async function list(req, res, next) {
  try {
    let filters = req.body

    let promotions = await Promotion.find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .skip(req.skip)
      .limit(req.query.limit)

    return res.status(200).send({
      success: 1,
      data: { promotion: promotions },
      error: null,
      message: _util_response.getResponse(71, req.headers.iso),
      paginate: await _util_response.responsePaginate(
        req,
        'Promotions',
        filters
      ),
    })
  } catch (error) {
    next(error)
  }
}
