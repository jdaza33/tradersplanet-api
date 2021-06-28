/**
 * @descripcion Servicio de stripe
 */

//Modules
const mongoose = require('mongoose')
const Stripe = require('stripe')

//Models
const Education = require('../models/education')
const Service = require('../models/service')
const Subscription = require('../models/subscription')
const User = require('../models/user')

module.exports = {
  newPayment,
  newPaymentWithSource,
  newPaymentCheckout,
  getSessionId,
  createProduct,
  createPriceProduct,
  listPriceProduct,
  getCustomer,
  createCustomer,
  addCardToCustomer,
  getCardsCustomer,
  createSource,
  newPaymentSubscription
}

function createSource({ number, exp_month, exp_year, cvc, name, customer }) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      //Create token
      let { id } = await stripe.tokens.create({
        card: {
          number,
          exp_month,
          exp_year,
          cvc,
          name,
          // customer,
        },
      })

      resolve(id)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function newPayment(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      //Create token
      let token = await stripe.tokens.create({
        card: {
          number: data.numbercard,
          exp_month: parseInt(data.monthcard),
          exp_year: data.yearcard,
          cvc: data.cvccard,
          name: data.name,
        },
      })

      let charge = await stripe.charges.create({
        amount: Math.round(data.amount * 100),
        currency: 'usd',
        source: token.id,
        receipt_email: data.email,
        description: data.description,
      })

      resolve(charge)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

/**
 * @description Realiza un pago directo
 * @param {number} amount
 * @param {string} source
 * @param {string} customerId
 * @param {string} productId
 * @returns {object}
 */
function newPaymentWithSource(amount, source, customerId, productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)
      let charge = await stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: process.env.CURRENCY_DEFAULT,
        source: source,
        customer: customerId,
        metadata: {
          productId,
        },
      })

      resolve(charge)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function newPaymentSubscription(customerId, priceId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      })

      resolve(subscription)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function newPaymentCheckout(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)
      let session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            name: data.name,
            images: [data.image],
            amount: data.price,
            currency: 'usd',
            quantity: 1,
          },
        ],
        success_url: data.success_url,
        cancel_url: data.cancel_url,
      })
      return resolve(session)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 *
 * @param {string} sessionId
 */
function getSessionId(sessionId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)
      let session = await stripe.checkout.sessions.retrieve(sessionId)
      return resolve(session)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Crea un producto en Stripe (Curso, servicio o suscripcion)
 * @param {string} type Tipo del modelo [subscription, service, education]
 * @param {object} object Objeto del modelo
 * @returns {product}
 */
function createProduct(type, object) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      const { _id: objectId, stripeId, name, title } = object

      if (!objectId) return reject(`El objeto ${type} no existe`)

      //Buscamos el producto en stripe
      if (stripeId) {
        let { id: productId } = await stripe.products.retrieve(stripeId)
        if (productId) {
          console.log('El producto ya existe')
          return resolve()
        }
      }

      //Crear producto
      let product = await stripe.products.create({
        name: name || title,
        metadata: { id: objectId.toString(), type },
      })

      const Model = require(`../models/${type}`)

      //Actualizamos
      await Model.findOneAndUpdate(
        { _id: objectId },
        { $set: { stripeId: product.id } }
      )

      return resolve(product)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Crea los precios de un producto en Stripe
 * @param {string} productId
 * @param {string} type [subscription, education, service]
 * @param {number} price
 * @param {object} obj Objeto de suscripcion
 * @returns {priceProduct}
 */
function createPriceProduct(productId, type, price, obj) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let priceProduct = null
      if (type == 'education' || type == 'service') {
        priceProduct = await stripe.prices.create({
          unit_amount: price * 100,
          currency: process.env.CURRENCY_DEFAULT,
          product: productId,
        })
      }
      if (type == 'subscription') {
        for (let payment of obj.payments) {
          priceProduct = await stripe.prices.create({
            unit_amount: payment.price * 100,
            currency: process.env.CURRENCY_DEFAULT,
            product: productId,
            metadata: { paymentId: payment._id.toString() },
            recurring:
              payment.type == 'singlePayment'
                ? null
                : {
                    interval:
                      payment.type == 'monthly' || payment.type == 'quarterly'
                        ? 'month'
                        : 'year',
                    interval_count:
                      payment.type == 'monthly' || payment.type == 'yearly'
                        ? 1
                        : 3,
                  },
          })

          await Subscription.updateOne(
            { _id: obj._id, 'payments._id': payment._id },
            { $set: { 'payments.$.priceId': priceProduct.id } }
          )
        }
      }
      return resolve(priceProduct)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Lista los precios de un producto
 * @param {string} productId
 * @returns {[prices]}
 */
function listPriceProduct(productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let { data } = await stripe.prices.list({
        product: productId,
      })

      return resolve(data)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Crear un cliente en Stripe, si ya este creado, lo busca y retorna el objeto customer
 * @param {string} userId
 * @returns {customer}
 */
function createCustomer(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      //Buscamos el usuario en nuestra bd
      let user = await User.findOne(
        { _id: userId },
        { _id: 1, name: 1, lastname: 1, email: 1, stripeId: 1 }
      ).lean()

      //Buscamos el usuario en stripe
      if (user.stripeId) {
        let isCustomer = await getCustomer({ customerId: user.stripeId })
        if (isCustomer) return resolve(isCustomer)
      }

      let customer = await stripe.customers.create({
        name: `${user.name} ${user.lastname}`,
        email: user.email,
        metadata: { id: userId },
      })

      await User.findOneAndUpdate(
        { _id: userId },
        { $set: { stripeId: customer.id } }
      )

      return resolve(customer)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Busca un cliente en Stripe
 * @param {object} customerId or userId
 * @returns {string} ID
 */
function getCustomer({ customerId, userId }, validate = true) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      if (userId) {
        const user = await User.findById(userId, { stripeId: 1 })
        if (!user.stripeId && validate)
          return reject(`El stripeId del usuario ${userId} no existe`)

        if (!user.stripeId && !validate) return resolve({ id: null, cards: [] })
        customerId = user.stripeId
      }

      const { id } = await stripe.customers.retrieve(customerId)

      if (!id && validate)
        return reject(`El customer con el customerId ${customerId} no existe`)

      if (!id && !validate) return resolve({ id: null, cards: [] })

      const cards = await getCardsCustomer(customerId)

      return resolve({ id, cards })
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Añade una tarjeta al cliente en Stripe
 * @param {string} customerId
 * @param {string} source
 * @returns {object}
 */
function addCardToCustomer(customerId, source) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let card = await stripe.customers.createSource(customerId, {
        source,
      })

      return resolve(card)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @description Obtiene las tarjetas de un cliente en Stripe
 * @param {string} customerId
 * @returns {[cards]}
 */
function getCardsCustomer(customerId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      const { data } = await stripe.customers.listSources(customerId, {
        object: 'card',
        limit: 10,
      })

      return resolve(data)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 * @test
 */
// const stripe = Stripe('sk_test_4EpcKa42hLuxBfuBPox2INRx00CJeIwAqP')
// stripe.products
//   .list({
//     limit: 10,
//   })
//   .then((res) => console.log(res))

// stripe.prices
//   .list({
//     product: 'prod_JkaLjBOVgylVwB',
//   })
//   .then((res) => console.log(res))

// stripe.prices
//   .create({
//     unit_amount: 2000,
//     currency: 'usd',
//     product: 'prod_FTggw5ZSDj6ElC',
//   })
//   .then((res) => console.log(res))

// stripe.customers
//   .list({
//     email: 'blackencio33s@gmail.com',
//   })
//   .then((res) => console.log(res))

// stripe.products.retrieve('prod_FTggw5ZSDj6ElC').then((res) => console.log(res))
