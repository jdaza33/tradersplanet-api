/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const User = new Schema({
  name: { type: String, required: true },
  ocupation: { type: String, default: 'n/a', required: false },
  lastname: { type: String, default: '', required: false },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  summary: String,
  phone: String,
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'auditor', 'publisher'],
    required: true
  },
  active: { type: Boolean, default: true, required: true },
  gender: { type: String, enum: ['male', 'female'], required: false },
  photo: { type: String, required: false },
  paidcourses: [{ type: String, required: false, ref: 'Educations' }]
})

User.plugin(timestamp)

module.exports = mongoose.model('Users', User)
