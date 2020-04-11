const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

const credentials = {
    key: fs.readFileSync('docker/nginx/ssl/device.key', 'utf8'),
    cert: fs.readFileSync('docker/nginx/ssl/chat.dv.crt', 'utf8')
};
let httpsServer = https.createServer(credentials, app);
let io = require('socket.io')(httpsServer);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
let clients = [];

io.on('connection', function(socket){
    socket.on('newClient', function() {
        if (clients.length < 2) {
            clients.push(socket.id);
        } else {
            this.emit('sessionActive');
            return;
        }
        console.log(clients);
        if (clients.length === 2) {
            this.emit('createPeer');
        }
    });
    socket.on('offer', sendOffer);
    socket.on('answer', sendAnswer);
    socket.on('disconnect', function() {
        console.log('User left - '+ socket.id);
        socket.broadcast.emit('disconnected');
        let i = clients.indexOf(socket.id);
        clients.splice(i, 1);
    });
});

function sendOffer(offer) {
    this.broadcast.emit("backOffer", offer);
}

function sendAnswer(data) {
    this.broadcast.emit("backAnswer", data);
}

httpsServer.listen(3000);
httpsServer.on('listening', function() {
    console.log('Express server started on port %s', httpsServer.address().port);
});