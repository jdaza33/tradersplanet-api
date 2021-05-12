/**
 * @description Servicio para las conexiones con mailchimp
 */

const Mailchimp = require('mailchimp-api-v3')

function listAudiences() {
  return new Promise(async (resolve, reject) => {
    try {
      const mailchimp = new Mailchimp(process.env.API_KEY_MAILCHIMP)
      mailchimp.get(
        {
          path: '/lists',
        },
        (err, list) => {
          if (err) reject(err)
          resolve(list.lists)
        }
      )
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function addMemberToAudience(name, email, audienceId) {
  return new Promise(async (resolve, reject) => {
    try {
      const mailchimp = new Mailchimp(process.env.API_KEY_MAILCHIMP)
      mailchimp.post(
        {
          path: `/lists/${audienceId}/members`,
        },
        {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: name,
          },
        },
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

module.exports = {
  listAudiences,
  addMemberToAudience,
}
