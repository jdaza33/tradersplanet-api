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
  saveCard,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        createCustomer,
        getCustomer,
        addCardToCustomer,
        newPaymentWithSource,
        newPaymentSubscription,
        deleteCardCustomer,
      } = require('../services/stripe.srv')

      const { sendMailNewSubscription } = require('../services/nodemailer.srv')

      const { addToChannel } = require('../services/discord.srv')

      //Creamos el usuario si aplica
      let customer = null
      if (isNew) {
        if (!source) return reject(_util_response.getResponse(73))

        customer = await createCustomer(userId)
        let { id: cardId } = await addCardToCustomer(customer.id, source)
        source = cardId
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
        let sub = await Subscription.findOne(
          { _id: typeId },
          { payments: 1 }
        ).lean()

        if (!sub) return reject(_util_response.getResponse(79))

        let objPayment = sub.payments.find((p) => p.priceId == priceId)

        if (!objPayment) return reject(_util_response.getResponse(80))

        //Realizamos el cobro
        payment = await newPaymentSubscription(customer.id, priceId)

        const { current_period_end } = payment

        let exp = moment.unix(current_period_end).valueOf()
        // if (objPayment) {
        //   if (objPayment.type == 'monthly') exp = moment().add(1, 'month')
        //   if (objPayment.type == 'quarterly') exp = moment().add(3, 'month')
        //   if (objPayment.type == 'yearly') exp = moment().add(1, 'year')
        // }

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
          { $set: { subscriptionId: payment.id, expSub: exp } }
        )

        pay = JSON.parse(JSON.stringify(pay))

        //Si esta enlazado con discord, lo añadimos al servidor
        addToChannel(userId)
        // const linkedDiscordSuccess = addToChannel(userId)
        // pay.discordLinked = linkedDiscordSuccess && true
        // pay.accessToDiscord = linkedDiscordSuccess && true

        sendMailNewSubscription(userId)
      } else {
        //Obtenemos el precio
        let { price, stripeId: productId } = await checkPriceModel(
          type,
          typeId,
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

        //Eliminamos la tarjeta si no desea guardarla
        if (!saveCard) await deleteCardCustomer(customer.id, source)
      }

      return resolve(pay)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

const checkPriceModel = (type, typeId, coupon) => {
  return new Promise(async (resolve, reject) => {
    try {
      let types = process.env.TYPES_PAYMENTS
      if (!types.includes(type)) return reject(_util_response.getResponse(69))

      const Model = require(`../models/${type}`)

      let model = await Model.findOne(
        { _id: typeId },
        { _id: 1, name: 1, stripeId: 1, payments: 1, price: 1 }
      ).lean()

      let price = model.price

      //Obtenemos el precio segun el modelo
      // if (type == 'subscription') {
      //   let pay = model.payments.find((p) => p.type == typePayment)
      //   if (!pay) return reject('No existe el tipo de pago de la suscripcion')

      //   price = pay.price
      // } else {
      //   price = model.price
      // }

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
          _id: { $in: paidEducations.map((p) => p.payFor.id) },
        },
        { _id: 1, title: 1 }
      ).lean()

      //Buscamos su suscripcion
      let subscriptionStatus = { active: false }
      if (user.subscriptionId && /sub/i.test(user.subscriptionId)) {
        //Buscamos el pago
        const { payFor } = await Payment.findOne(
          {
            $and: [{ userId }, { 'pay.id': user.subscriptionId }],
          },
          { _id: 1, payFor: 1 }
        ).lean()

        if (payFor) {
          let sub = await Subscription.findOne(
            {
              _id: payFor.id,
            },
            { name: 1, payments: 1 }
          ).lean()

          if (sub && sub.payments && sub.payments.length > 0) {
            const { price, priceId, type } = sub.payments[0]
            sub = { ...sub, price, priceId, type }
            delete sub.payments
            subscriptionStatus = { ...subscriptionStatus, ...sub }
          }
        }

        const {
          id,
          cancel_at_period_end,
          current_period_end,
          current_period_start,
          created,
          cancel_at,
          status,
        } = await getSubscription(user.subscriptionId)

        if (status == 'active') {
          subscriptionStatus.active = true
          subscriptionStatus.expireAt = moment.unix(current_period_end)
          subscriptionStatus.startAt = moment.unix(current_period_start)
          subscriptionStatus.createdAt = moment.unix(created)
        } else if (status == 'canceled' || cancel_at_period_end == true) {
          subscriptionStatus.active =
            moment.unix(current_period_end).valueOf() < Date.now()
              ? false
              : true
          subscriptionStatus.cancel = true
          subscriptionStatus.cancelAt = moment.unix(cancel_at)
          subscriptionStatus.expireAt = moment.unix(current_period_end)
          subscriptionStatus.startAt = moment.unix(current_period_start)
          subscriptionStatus.createdAt = moment.unix(created)
        } else {
          subscriptionStatus.active = false
          subscriptionStatus.expireAt = moment.unix(current_period_end)
        }
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
