/**
 * @description Utilidad para el manejo de errores
 */

module.exports = {
  errorHandler
}

/**
 * 
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 */
function errorHandler(err, req, res, next) {
  console.log(err)
  return res.status(500).json({
    success: 0,
    data: null,
    error: err.toString()
  })
}
