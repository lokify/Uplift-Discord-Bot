const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('The bot is live');
  res.end();
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
