var https=require('https');
https.createServer(function(req,res){
  res.write(" The bot is live ");
  res.end();
}).listen(8080);
