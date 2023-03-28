require('dotenv').config()
const runes = require('runes')

const discordModals = require('discord-modals');
const {Intents, Client, Collection} = require('discord.js');
const {registerEvents} = require('./src/utils/setup/Register');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
(async () => {
    discordModals(client)
    client.commands = new Collection()
    client.events = new Collection()
    client.prefix = '!'
    client.colour = '#fca41c'
    client.login(process.env.DISCORD_TOKEN)
    await registerEvents(client, '../../events')
})();

//https://discord.com/api/oauth2/authorize?client_id=979107553088790629&permissions=8&scope=bot

//Catch unexpected discord errors, often caused by missing permissions
// process.on('unhandledRejection',err => {
// 	console.log(err);
// });