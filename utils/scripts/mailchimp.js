/**
 * @description Script probar endpoints de mailchimp
 */

const Mailchimp = require('mailchimp-api-v3')
require('dotenv').config()
var mailchimp = new Mailchimp(process.env.API_KEY_MAILCHIMP)

async function main() {
  try {
    await mailchimp.get(
      {
        path: '/lists',
      },
      function (err, result) {
        if (err) console.log(err)
        console.log(result)
      }
    )

    // await mailchimp.batch(
    //   {
    //     method: 'get',
    //     path: '/lists/9870fe359a/members',
    //     query: {
    //       count: 10000000000,
    //     },
    //   },
    //   function (err, result) {
    //     if (err) console.log(err)
    //     console.log(result.members.length)
    //   }
    // )
  } catch (error) {
    console.log(error)
  }
}

main()
