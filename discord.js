const Discord = require('discord.js')

const client = new Discord.Client()

const guildTplanet = new Discord.Guild(client)
  .addMember('831773022800576533', {
    accessToken: 'gMcyhEoGTe1ovY5FVb1ZWtkkpk4tz8',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err))

// const users = new Discord.Guild(client)

// console.log(users.id)

client.login('ODMxNzQyNjYxMDQ3MDkxMjIw.YHZqtw.omigYoC6zW8S60L5JTXeYkhkyNY')
