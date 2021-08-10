const Discord = require('discord.js')

const client = new Discord.Client()

// const guildTplanet = new Discord.Guild(client)
//   .addMember('831773022800576533', {
//     accessToken: '',
//   })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))

// const users = new Discord.Guild(client)

// console.log(users.id)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  if (msg.content === 'ping') msg.reply('pong')
})

client.login(process.env.BOT_DISCORD)
