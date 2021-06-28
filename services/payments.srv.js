/**
 * @description Servicio de pagos
 */

//Modules
const moment = require('moment')

//Models
const User = require('../models/user')
const Service = require('../models/service')
const Education = require('../models/education')
const Subscription = require('../models/subscription')
const Payment = require('../models/payment')

//Utils
const _util_response = require('../utils/response.util')

const newPayment = ({
  type,
  typeId,
  userId,
  isNew,
  source,
  coupon,
  typePayment,
  useCard,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        createCustomer,
        getCustomer,
        addCardToCustomer,
        listPriceProduct,
        newPaymentWithSource,
      } = require('../services/stripe.srv')

      //Creamos el usuario si aplica
      let customer = null
      if (isNew) {
        if (!source) return reject(_util_response.getResponse(73))

        customer = await createCustomer(userId)
        let { id: cardId } = await addCardToCustomer(customer.id, source)
        source = cardId
      } else {
        if (!useCard) return reject(_util_response.getResponse(73))

        customer = await getCustomer({ userId })
        source = useCard
      }

      //Obtenemos el precio
      let { price, stripeId: productId } = await checkPriceModel(
        type,
        typeId,
        typePayment,
        coupon
      )

      let pay = null

      //Realizamos el pago
      if (type == 'subscription') {
      } else {
        let payment = await newPaymentWithSource(
          price,
          source,
          customer.id,
          productId
        )

        pay = await Payment.create({
          pay: { id: payment.id, type: 'stripe' },
          userId,
          amount: price,
          payFor: { id: typeId, payFor: type },
          createdAt: moment().valueOf(),
          expireAt: moment().add(20, 'year'),
          createdBy: userId,
        })
      }

      return resolve(pay)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

const checkPriceModel = (type, typeId, typePayment, coupon) => {
  return new Promise(async (resolve, reject) => {
    try {
      let types = process.env.TYPES_PAYMENTS
      if (!types.includes(type)) return reject(_util_response.getResponse(69))

      const Model = require(`../models/${type}`)

      let model = await Model.findOne(
        { _id: typeId },
        { _id: 1, name: 1, stripeId: 1, payments: 1, price: 1 }
      ).lean()

      let price = ''

      //Obtenemos el precio segun el modelo
      if (type == 'subscription') {
        let pay = model.payments.find((p) => p.type == typePayment)
        if (!pay) return reject('No existe el tipo de pago de la suscripcion')

        price = pay.price
      } else {
        price = model.price
      }

      /**
       * @todo
       * Aqui va las validaciones de las promociones
       */

      return resolve({ price, stripeId: model.stripeId })
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
