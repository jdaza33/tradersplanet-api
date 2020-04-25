/**
 * @description Manejo de rutas
 */

'use strict'

//Modules
const express = require('express')
const fsp = require('promise-fs')
const mime = require('mime')

//Constantes
const router = express.Router()

//Controllers
const userCtrl = require('../controllers/user.ctrl')
const lessonCtrl = require('../controllers/lesson.ctrl')
const educationCtrl = require('../controllers/education.ctrl')
const postCtrl = require('../controllers/post.ctrl')
const serviceCtrl = require('../controllers/service.ctrl')
const testimonyCtrl = require('../controllers/testimony.ctrl')
const contactCtrl = require('../controllers/contact.ctrl')
const mailchimpCtrl = require('../controllers/mailchimp.ctrl')
const audienceCtrl = require('../controllers/audience.ctrl')
const subscriberCtrl = require('../controllers/subscriber.ctrl')
const webhookCtrl = require('../controllers/webhook.ctrl')

//Multer
const multer = require('multer')
const path = require('path')
const _folderUploads = path.join(__dirname, '../files/')

// Storage para subir los archivos
let storageFile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, _folderUploads)
  },
  filename: (req, file, cb) => {
    let ext = file.originalname.split('.')
    ext = ext[ext.length - 1]
    cb(null, `file_${Date.now()}.${ext}`)
  },
})
let _upload = multer({ storage: storageFile })

/** Users */
router.post('/users/create', userCtrl.create)
router.post('/users/list', userCtrl.list)
router.get('/users/:id', userCtrl.get)
router.put('/users/:id', userCtrl.edit)
router.delete('/users/:id', userCtrl.del)
router.post('/users/login', userCtrl.login)
router.post(
  '/users/upload/photo/:id',
  _upload.single('file'),
  userCtrl.setPhoto
)
router.put('/users/pay/course/:id/:courseId', userCtrl.payCourse)

/** Lessons */
router.post('/lessons/create', lessonCtrl.create)
router.post('/lessons/list', lessonCtrl.list)
router.get('/lessons/:id', lessonCtrl.get)
router.put('/lessons/:id', lessonCtrl.edit)
router.delete('/lessons/:id', lessonCtrl.del)

/** Educations */
router.post('/educations/create', educationCtrl.create)
router.post('/educations/list', educationCtrl.list)
router.get('/educations/:id', educationCtrl.get)
router.put('/educations/:id', educationCtrl.edit)
router.delete('/educations/:id', educationCtrl.del)
router.post(
  '/educations/upload/img/:id',
  _upload.single('file'),
  educationCtrl.setImg
)

/** Posts */
router.post('/posts/create', postCtrl.create)
router.post('/posts/list', postCtrl.list)
router.get('/posts/:id', postCtrl.get)
router.put('/posts/:id', postCtrl.edit)
router.delete('/posts/:id', postCtrl.del)
router.post(
  '/posts/upload/background/:id',
  _upload.single('file'),
  postCtrl.setBackground
)

/** Services */
router.post('/services/create', serviceCtrl.create)
router.post('/services/list', serviceCtrl.list)
router.get('/services/:id', serviceCtrl.get)
router.put('/services/:id', serviceCtrl.edit)
router.delete('/services/:id', serviceCtrl.del)

/** Testimonies */
router.post('/testimonies/create', testimonyCtrl.create)
router.post('/testimonies/list', testimonyCtrl.list)
router.get('/testimonies/:id', testimonyCtrl.get)
router.put('/testimonies/:id', testimonyCtrl.edit)
router.delete('/testimonies/:id', testimonyCtrl.del)

/** Contact */
router.post('/contact/create', contactCtrl.create)

/** Mailchimp */
router.post('/mailchimp/insert/audiences', mailchimpCtrl.insertAudiences)

/** Audiences */
router.post('/audiences/list', audienceCtrl.list)

/** Webhook */
router.get('/webhook', (req, res, next) => {
  try {
    return res.status(200).json({ success: 1 })
  } catch (error) {
    console.log(error)
    return res.status(403).json({ success: 0 })
  }
})
router.post('/webhook', webhookCtrl.main)

/** Subscribers */
router.post('/subscribers/create', subscriberCtrl.create)
router.post('/subscribers/list', subscriberCtrl.list)

/** Uploads */
router.get('/file/:name', async (req, res, next) => {
  try {
    let name = req.params.name
    let file = path.join(__dirname, `../files/${name}`)
    let data = await fsp.readFile(file)
    let ext = name.split('.')
    ext = ext[ext.length - 1]
    res.contentType(mime.getType(ext))
    return res.send(data)
  } catch (error) {
    console.log('Error al consultar archivo')
    next(error)
  }
})

/** Middleware - Devuelve un error 404 si la ruta solicitada no está definida */
router.use('*', (req, res) => {
  return res.status(404).send({
    success: 0,
    data: null,
    error: {
      status: 404,
      type: 'Resource not found',
      reason: 'Application does not support the requested path.',
    },
  })
})

module.exports = router
