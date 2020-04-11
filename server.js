var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.send('Hello world');
});

server.listen(3000);
server.on('listening', function() {
    console.log('Express server started on port %s', server.address().port);
});