const { WebClient } = require('@slack/web-api')

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = 'xoxb-1184249406592-1200507334261-mMQR0lvq4sqPynV96V2VVnt9'

const web = new WebClient(token)

web.users
  .list({})
  .then((res) => {
    console.log(res)
  })
  .catch((err) => console.log(err))
