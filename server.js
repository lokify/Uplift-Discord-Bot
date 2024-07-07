// server.js
const http = require('http');

const keepAlive = () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('The bot is alive!');
    });

    server.listen(process.env.PORT || 10000, () => {
        console.log(`Server is running on port ${process.env.PORT || 10000}`);
    });
};

module.exports = keepAlive;
