/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Testimony = new Schema({
  email: { type: String, required: true },
  active: { type: Boolean, default: false, required: true },
  name: { type: String, unique: false, required: false },
  // userId: { type: String, unique: false, required: false, ref: 'Users' },
  content: { type: String, unique: false, required: true },
  phone: { type: String, unique: false, required: false },
  educationId: {
    type: String,
    unique: false,
    required: false,
    ref: 'Educations',
  },
})

Testimony.plugin(timestamp)

module.exports = mongoose.model('Testimonies', Testimony)
