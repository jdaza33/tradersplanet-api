/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Education = new Schema({
  title: { type: String, trim: true },
  content: { type: String, trim: true },
  tutor: { type: String, trim: true },
  published: Boolean,
  price: Number,
  offprice: Number,
  img: String,
  temary: String
})

Education.plugin(timestamp)

module.exports = mongoose.model('Educations', Education)
