/**
 * @description Servicio para las conexiones con aws
 */

const AWS = require('aws-sdk')
const mime = require('mime')
const fsp = require('promise-fs')
require('dotenv').config()

AWS.config.update({
  accessKeyId: process.env.S3_KEY_ACCESS,
  secretAccessKey: process.env.S3_KEY_SECRET,
  region: 'us-east-1',
})

module.exports = {
  uploadFileToS3,
}

function uploadFileToS3(file, model, modelId) {
  return new Promise(async (resolve, reject) => {
    try {
      let bucket = `${process.env.S3_BUCKET}/${model}`
      let ext = mime.getExtension(file.mimetype)
      let filename = `${modelId}.${ext}`

      /**Upload sencillo */
      let readStream = await fsp.createReadStream(file.path)
      let params = {
        Bucket: bucket,
        Key: filename,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Body: readStream,
      }
      let s3 = new AWS.S3({ params: { Bucket: bucket } })
      s3.putObject(params, function (err, data) {
        if (err) reject(err)
        resolve({
          message: 'Archivo subido con exito',
          path: `${bucket}/${filename}`,
          cdn: `${process.env.S3_URL}/${model}/${filename}?versionId=${data.VersionId}`,
          data,
        })
      })

      /**Upload multipart */
      // let readStream = await fsp.createReadStream(file.path)
      // let params = {
      //   Bucket: bucket,
      //   Key: filename,
      //   ACL: 'public-read',
      //   ContentType: file.mimetype,
      //   Body: readStream,
      // }
      // let options = { partSize: 5 * 1024 * 1024, queueSize: 10 }
      // let s3 = new AWS.S3({ httpOptions: { timeout: 10 * 60 * 1000 } })
      // s3.upload(params, options)
      //   .on('httpUploadProgress', function (evt) {
      //     console.log(
      //       'Completed ' +
      //         ((evt.loaded * 100) / evt.total).toFixed() +
      //         '% of upload'
      //     )
      //   })
      //   .send(function (err, data) {
      //     console.log('Upload done')
      //     if (err) reject(err)
      //     resolve({
      //       message: 'Archivo subido con exito',
      //       path: `${bucket}/${filename}`,
      //       cdn: `${process.env.S3_URL}/${model}/${filename}`,
      //       data,
      //     })
      //   })
    } catch (error) {
      console.log('Error al subir archivo')
      reject(error)
    }
  })
}
