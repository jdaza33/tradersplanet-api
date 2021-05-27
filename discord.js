const Discord = require('discord.js')

const client = new Discord.Client()

const guildTplanet = new Discord.Guild(client)
  .addMember('831773022800576533', {
    accessToken: '',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err))

// const users = new Discord.Guild(client)

// console.log(users.id)

client.login('')
