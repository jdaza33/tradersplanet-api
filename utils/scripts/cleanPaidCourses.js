/**
 * @description Limpiar los cursos pagados
 */

const mongoose = require('mongoose')
require('../../models/user')

mongoose.model('Users').updateMany({}, { paidcourses: [] })
