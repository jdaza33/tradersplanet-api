/**
 * @description Script para levantar los servicios de mongo
 */

const shell = require('shelljs')

if (process.env.NODE_ENV == 'development') {
  let ex1 = shell.exec(
    'mongod --config /home/jdaza/temp/mongod/rs1/mongod.conf'
  )
  //   console.log(ex1.stdout)
  let ex2 = shell.exec(
    'mongod --config /home/jdaza/temp/mongod/rs2/mongod.conf'
  )
  //   console.log(ex2.stdout)
  let ex3 = shell.exec(
    'mongod --config /home/jdaza/temp/mongod/rs3/mongod.conf'
  )
  //   console.log(ex3.stdout)
} else {
  let ex1 = shell.exec('mongod --config /home/ubuntu/mongod/rs1/mongod.conf')
  //   console.log(ex1.stdout)
  let ex2 = shell.exec('mongod --config /home/ubuntu/mongod/rs2/mongod.conf')
  //   console.log(ex2.stdout)
  let ex3 = shell.exec('mongod --config /home/ubuntu/mongod/rs3/mongod.conf')
  //   console.log(ex3.stdout)
}
