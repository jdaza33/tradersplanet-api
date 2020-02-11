/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Lesson = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  startDate: { type: Date, required: false },
  duration: { type: Number, required: false }, //minutos
  private: { type: Boolean, default: false, required: true },
  tutor: { type: String, ref: 'Users', required: true },
  finalized: { type: Boolean, default: false, required: false },
  accessAt: [{ type: String, required: false, ref: 'Users' }],
  sessionId: { type: String, required: true },
  token: { type: String, required: true }
})

Lesson.plugin(timestamp)

module.exports = mongoose.model('Lessons', Lesson)
