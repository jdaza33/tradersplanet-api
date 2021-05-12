/**
 * @description Script probar endpoints de mailchimp
 */

const Mailchimp = require('mailchimp-api-v3')

async function main() {
  try {
    const mailchimp = new Mailchimp(process.env.API_KEY_MAILCHIMP)
    // await mailchimp.post(
    //   {
    //     path: '/campaigns/9375798/actions/test',
    //     body: {
    //       test_emails: ['blackencio33@gmail.com'],
    //       test_emails: 'html',
    //     },
    //   },
    //   function (err, result) {
    //     if (err) console.log(err)
    //     console.log(result)
    //   }
    // )

    await mailchimp
      .post('/campaigns/9331f6edb2/actions/test', {
        test_emails: ['blackencio33@gmail.com'],
        send_type: 'regular',
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err))

    // await mailchimp.batch(
    //   {
    //     method: 'post',
    //     path: '/campaigns/9375798/actions/test',
    //     body: {
    //       test_emails: ['blackencio33@gmail.com'],
    //       test_emails: 'html',
    //     },
    //   },
    //   function (err, result) {
    //     if (err) console.log(err)
    //     console.log(result)
    //   }
    // )
  } catch (error) {
    console.log(error)
  }
}

main()
