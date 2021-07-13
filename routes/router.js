/**
 * @description Manejo de rutas
 */

'use strict'

//Modules
const express = require('express')
const fsp = require('promise-fs')
const mime = require('mime')
const cron = require('node-cron')

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
const paymentCtrl = require('../controllers/payment.ctrl')
const advertisingCtrl = require('../controllers/advertising.ctrl')
const discordCtrl = require('../controllers/discord.ctrl')
const subscriptionCtrl = require('../controllers/subscription.ctrl')
const promotionCtrl = require('../controllers/promotion.ctrl')

//Middlewares
const { isAuth, isUser } = require('../middlewares/middleware')

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
router.post('/users/list', isAuth, userCtrl.list)
router.get('/users/:id', isAuth, userCtrl.get)
router.put('/users/:id', isAuth, userCtrl.edit)
router.delete('/users/:id', isAuth, userCtrl.del)
router.post('/users/login', userCtrl.login)
router.post('/users/reset', userCtrl.resetPassword)
router.post(
  '/users/upload/photo/:id',
  _upload.single('file'),
  userCtrl.setPhoto
)
router.post('/users/:id/add/card', isAuth, userCtrl.addCardUser)
router.get('/users/:id/list/card', isAuth, userCtrl.listCardsUser)
router.put('/users/:id/update/card/:cardId', isAuth, userCtrl.updateCardUser)
router.put('/users/:id/delete/card/:cardId', isAuth, userCtrl.deleteCardUser)

router.delete('/users/:id/delete/subscription', userCtrl.deleteSubscriptionUser)

/** Educations */
router.post('/educations/create', isAuth, educationCtrl.create)
router.post('/educations/list', isUser, educationCtrl.list)
router.get('/educations/:id', isUser, educationCtrl.get)
router.put('/educations/:id', isAuth, educationCtrl.edit)
router.put('/educations/move/:id', isAuth, educationCtrl.move)
router.delete('/educations/:id', isAuth, educationCtrl.del)
router.post(
  '/educations/upload/img/:id',
  _upload.single('file'),
  educationCtrl.setImg
)

/** Posts */
router.post('/posts/create', isAuth, postCtrl.create)
router.post('/posts/list', postCtrl.list)
router.get('/posts/:id', postCtrl.get)
router.put('/posts/:id', isAuth, postCtrl.edit)
router.delete('/posts/:id', isAuth, postCtrl.del)
router.post(
  '/posts/upload/background/:id',
  _upload.single('file'),
  postCtrl.setBackground
)

/** Services */
router.post('/services/create', isAuth, serviceCtrl.create)
router.post('/services/list', isUser, serviceCtrl.list)
router.get('/services/:id', isUser, serviceCtrl.get)
router.put('/services/:id', isAuth, serviceCtrl.edit)
router.delete('/services/:id', isAuth, serviceCtrl.del)

/** Testimonies */
router.post('/testimonies/create', testimonyCtrl.create)
router.post('/testimonies/list', testimonyCtrl.list)
router.get('/testimonies/:id', testimonyCtrl.get)
router.put('/testimonies/:id', isAuth, testimonyCtrl.edit)
router.delete('/testimonies/:id', isAuth, testimonyCtrl.del)

/** Advertising */
router.post('/advertisings/create', isAuth, advertisingCtrl.create)
router.post('/advertisings/list', advertisingCtrl.list)
router.get('/advertisings/:id', advertisingCtrl.get)
router.put('/advertisings/:id', isAuth, advertisingCtrl.edit)
router.delete('/advertisings/:id', isAuth, advertisingCtrl.del)
router.post(
  '/advertisings/upload/image/:id/:op',
  _upload.single('file'),
  advertisingCtrl.setImage
)

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
router.post('/webhook/stripe', webhookCtrl.stripe)

/** Subscribers */
router.post('/subscribers/create', isAuth, subscriberCtrl.create)
router.post('/subscribers/list', subscriberCtrl.list)

/** Payments */
router.post('/payments/stripe/create', isAuth, paymentCtrl.payWithStripe)
router.post('/payments/source/create', isAuth, paymentCtrl.createSourceCard)

/** Subscriptions */
router.post('/subscriptions/create', isAuth, subscriptionCtrl.create)
router.post('/subscriptions/list', isUser, subscriptionCtrl.list)
router.post('/subscriptions/:id', isUser, subscriptionCtrl.get)

/** Subscriptions */
router.post('/promotions/create', isAuth, promotionCtrl.create)
router.post('/promotions/list', promotionCtrl.list)

/**
 * @deprecated
 */
/** Payments */
// router.post('/payments/stripe/create-source', paymentCtrl.createWithSource)
// router.post('/payments/stripe/create/sesion', paymentCtrl.createSesion)
// router.get('/payments/stripe/sesion/:sessionId', paymentCtrl.getSession)
/** Users */
// router.put('/users/pay/course/:id/:courseId', userCtrl.payCourse)
// router.get('/users/invite/slack/:id', userCtrl.inviteToSlack)
/** Lessons */
// router.post('/lessons/create', lessonCtrl.create)
// router.post('/lessons/list', lessonCtrl.list)
// router.get('/lessons/:id', lessonCtrl.get)
// router.put('/lessons/:id', lessonCtrl.edit)
// router.delete('/lessons/:id', lessonCtrl.del)

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

/** Redirect */
router.get('/redirect/slack', async (req, res, next) => {
  try {
    console.log(req.query)
    console.log(req.body)
    res.status(200)
  } catch (error) {
    console.log('Error al redireccionar')
    next(error)
  }
})

/** Discord */

router.get('/discord/auth', discordCtrl.auth)
router.get('/discord/get-auth', discordCtrl.getUrlAuth)

/** CRON */
cron.schedule('* * * * *', () => {
  // webhookCtrl.taskStripeCourse()
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
