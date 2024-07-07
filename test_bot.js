// test_bot.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('Starting test bot...');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

console.log('Attempting to log in...');
client.login(process.env.TOKEN)
    .then(() => {
        console.log('Login successful!');
    })
    .catch((error) => {
        console.error('Login failed!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    });

// Simple keep-alive server
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
});
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
