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
  useCard,
  priceId,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        createCustomer,
        getCustomer,
        addCardToCustomer,
        newPaymentWithSource,
        newPaymentSubscription,
      } = require('../services/stripe.srv')

      //Creamos el usuario si aplica
      let customer = null
      if (isNew) {
        if (!source) return reject(_util_response.getResponse(73))

        customer = await createCustomer(userId)
        console.log('customer', customer)
        let { id: cardId } = await addCardToCustomer(customer.id, source)
        source = cardId
        console.log('cardId', cardId)
      } else {
        if (!type == 'subscription' && !useCard)
          return reject(_util_response.getResponse(76))

        customer = await getCustomer({ userId })
        source = useCard
      }

      let payment = null
      let pay = null

      //Realizamos el pago
      if (type == 'subscription') {
        payment = await newPaymentSubscription(customer.id, priceId)

        let sub = await Subscription.findOne(
          { _id: typeId },
          { payments: 1 }
        ).lean()

        let objPayment = sub.payments.find((p) => p.priceId == priceId)
        let exp = 0
        if (objPayment) {
          if (objPayment.type == 'monthly') moment().add(1, 'month')
          if (objPayment.type == 'quarterly') moment().add(3, 'month')
          if (objPayment.type == 'yearly') moment().add(1, 'year')
        }

        pay = await Payment.create({
          pay: { id: payment.id, type: 'stripe' },
          userId,
          amount: objPayment ? objPayment.price : 0,
          payFor: { id: typeId, payFor: type },
          createdAt: moment().valueOf(),
          expireAt: exp,
          createdBy: userId,
        })

        //Actualizamos el usuario
        await User.updateOne(
          { _id: userId },
          { $set: { subscriptionId: payment.id } }
        )
      } else {
        //Obtenemos el precio
        let { price, stripeId: productId } = await checkPriceModel(
          type,
          typeId,
          typePayment,
          coupon
        )

        payment = await newPaymentWithSource(
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
          expireAt: 0,
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

const checkPaymentsUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { getSubscription } = require('./stripe.srv')

      const user = await User.findOne(
        { _id: userId },
        { stripeId: 1, subscriptionId: 1 }
      ).lean()

      //Buscamos los cursos
      const paidEducations = await Payment.find(
        { $and: [{ userId }, { 'payFor.payFor': 'education' }] },
        { _id: 1, payFor: 1 }
      ).lean()

      const educations = await Education.find(
        {
          _id: paidEducations.map((p) => p.payFor.payFor),
        },
        { _id: 1, title: 1 }
      ).lean()

      //Buscamos su suscripcion

      const {
        id,
        cancel_at_period_end,
        current_period_end,
        current_period_start,
        created,
        cancel_at,
        status,
      } = await getSubscription(user.subscriptionId)

      let subscriptionStatus = {}
      if (status == 'active') {
        subscriptionStatus.active = true
        subscriptionStatus.expireAt = moment().add(
          current_period_end,
          'millisecond'
        )
      } else if (status == 'canceled' || cancel_at_period_end == true) {
        subscriptionStatus.active = false
        subscriptionStatus.cancel = true
        subscriptionStatus.expireAt = moment().add(
          current_period_end,
          'millisecond'
        )
        subscriptionStatus.cancelAt = moment().add(cancel_at, 'millisecond')
      } else {
        subscriptionStatus.active = false
        subscriptionStatus.expireAt = moment().add(
          current_period_end,
          'millisecond'
        )
      }

      return resolve({ paidCourses: educations, subscriptionStatus })
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

module.exports = {
  newPayment,
  checkPriceModel,
  checkPaymentsUser,
}
