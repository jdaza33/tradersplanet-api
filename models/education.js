/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Education = new Schema({
  title: { type: String, trim: true },
  content: { type: String, trim: true },
  tutor: { type: String, trim: true, ref: 'Users' },
  published: { type: Boolean, default: false },
  price: Number,
  short_description: String,
  large_description: String,
  learn: [String],
  img: String,
  tags: [String],
  requirements: [String],
  order: { type: Number, required: true },
  stripeId: { type: String, trim: true },

  /**
   * @deprecated
   */
  offprice: { type: Number, default: 0 },
})

Education.plugin(timestamp)

Education.post('save', async function (doc, next) {
  try {
    const {
      createProduct,
      createPriceProduct,
    } = require('../services/stripe.srv')
    const { id } = await createProduct('education', doc)
    await createPriceProduct(id, 'education', doc.price, null)
    next()
  } catch (error) {
    console.log(error)
    return error
  }
})

module.exports = mongoose.model('Educations', Education)
