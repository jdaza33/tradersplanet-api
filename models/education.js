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

module.exports = mongoose.model('Educations', Education)
