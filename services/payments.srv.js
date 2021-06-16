/**
 * @description Servicio de pagos
 */

//Modules

//Models
const User = require('../models/user')
const Service = require('../models/service')
const Education = require('../models/education')
const Subscription = require('../models/subscription')

//Utils
const _util_response = require('../utils/response.util')

const newPayment = ({
  type,
  typeId,
  userId,
  isNew,
  source,
  coupon,
  saveCard,
  typePayment,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkPriceModel(type, typeId)
      return resolve()
    } catch (error) {
      return reject(error)
    }
  })
}

const checkPriceModel = (type, typeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let types = process.env.TYPES_PAYMENTS
      if (!types.includes(type)) return reject(_util_response.getResponse(69))

      const Model = require(`../models/${type}`)

      let model = await Model.findOne(
        { _id: typeId },
        { _id: 1, name: 1, stripeId: 1 }
      ).lean()

      /**
       * @todo
       * Aqui va las validaciones de las promociones
       */

      return resolve()
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

module.exports = {
  newPayment,
  checkPriceModel,
}
