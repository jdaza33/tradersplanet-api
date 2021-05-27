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

function newPaymentWithSource(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)
      let charge = await stripe.charges.create({
        amount: Math.round(data.amount * 100),
        currency: 'usd',
        source: data.source,
        receipt_email: data.email,
        description: data.description,
        metadata: {
          objectType: data.type,
          objectId: data.typeId,
        },
      })

      resolve(charge)
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

function createProduct(name, id, type) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let object = null
      if (type == 'education')
        object = await Education.findOne({ _id: id }, { _id: 1, stipeId: 1 })
      if (type == 'service')
        object = await Service.findOne({ _id: id }, { _id: 1, stipeId: 1 })
      if (type == 'subscription')
        object = await Subscription.findOne(
          { _id: id },
          { _id: 1, stipeId: 1, payments: 1 }
        )

      if (!object) return reject(`El objeto ${type} con id: ${id} no existe`)

      //Buscamos el producto en stripe
      if (object.stipeId) {
        let { id: productId } = await stripe.products.retrieve(object.stipeId)
        if (productId) return reject('El producto ya existe')
      }

      //Crear producto
      let product = await stripe.products.create({
        name,
        metadata: { id, type },
      })

      //Actualizamos
      await mongoose
        .model(`${type}s`)
        .findOneAndUpdate({ _id: id }, { $set: { stipeId: product.id } })

      return resolve(product)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

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
        }
      }

      return resolve(priceProduct)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

function listPriceProduct(productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let product = await stripe.prices.list({
        product: productId,
      })

      return resolve(product)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

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
      if (user.stipeId) {
        let isCustomer = await getCustomer(user.stipeId)
        if (isCustomer) return resolve(isCustomer)
      }

      let customer = await stripe.customers.create({
        name: `${user.name} ${user.lastname}`,
        email,
        metadata: { id: _id },
      })

      await mongoose
        .model(`users`)
        .findOneAndUpdate({ _id: userId }, { $set: { stipeId: customer.id } })

      return resolve(customer)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

function getCustomer(customerId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let { id } = await stripe.customers.retrieve(customerId)

      return resolve(id)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

function addCardToCustomer(customerId, number, exp_month, exp_year, cvc, name) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripe = Stripe(process.env.KEY_SECRET_STRIPE)

      let card = await stripe.customers.createSource(customerId, {
        source: { number, exp_month, exp_year, cvc, name },
      })

      return resolve(card)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

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
}

/**
 * @test
 */
const stripe = Stripe('sk_test_4EpcKa42hLuxBfuBPox2INRx00CJeIwAqP')
// stripe.products
//   .list({
//     limit: 10,
//   })
//   .then((res) => console.log(res))

// stripe.prices
//   .list({
//     product: 'prod_FTggw5ZSDj6ElC',
//   })
//   .then((res) => console.log(JSON.stringify(res)))

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
