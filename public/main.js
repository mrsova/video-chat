const server = 'https://chat.local.dv:3000';
const video = document.querySelector('video');
const filter = document.querySelector('#filter');
const checkboxTheme = document.querySelector('#theme');

let Peer = require('simple-peer');
const socket = require('socket.io-client')(server);

let client = {};
let currentFilter;
//get stream
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        socket.emit('newClient');
        video.srcObject = stream;
        video.play();

        filter.addEventListener('change', (event) => {
            currentFilter = event.target.value;
            video.style.filter = currentFilter;
            sendFilter(currentFilter);
            event.preventDefault;
        });

        // used to initialize a peer
        function initPeer(type) {
            let peer = new Peer({
                initiator: type === 'init',
                stream:stream,
                trickle:false
            });
            peer.on('stream', function (stream) {
                createVideo(stream);
            });
            peer.on('data', function (data) {
                let decodedData = new TextDecoder('utf-8').decode(data);
                let peervideo = document.querySelector('#peerVideo');
                peervideo.style.filter = decodedData;
            });
            return peer
        }

        // for peer of type init
        function makePeer() {
            client.gotAnswer = false;
            let peer = initPeer('init');

            peer.on('signal', function(data) {
                if (!client.gotAnswer) {
                    socket.emit('offer', data);
                }
            });
            client.peer = peer;
        }

        // for peer of type not init
        function frontAnswer(offer) {
            let peer = initPeer('notInit');
            peer.on('signal', (data) => {
                socket.emit('answer', data);
            });
            peer.signal(offer);
            client.peer = peer;
        }

        function signalAnswer(answer) {
            client.gotAnswer = true;
            let peer = client.peer;
            peer.signal(answer);
        }

        function createVideo(stream) {
            createDiv();
            let video = document.createElement('video');
            video.playsinline = true;
            video.autoplay = true;
            video.muted = true;
            video.id = 'peerVideo';
            video.srcObject = stream;
            video.setAttribute('class', 'embed-responsive-item');
            document.querySelector('#peerDiv').appendChild(video);
            video.play();

            //wait for 1 sec
            setTimeout(() => sendFilter(currentFilter), 1000);

            video.addEventListener('click', () => {
                if (video.volume !== 0) {
                    video.volume = 0;
                } else {
                    video.volume = 1;
                }
            });
        }

        function sessionActive() {
            document.write('Session Active. Please come back later');
        }


        function removePeer() {
            let videoClient = document.getElementById("peerVideo");
            if (videoClient) {
                document.getElementById("peerVideo").remove();
            }
            if (client.peer) {
                client.peer.destroy()
            }
        }

        function sendFilter(filter) {
            if (client.peer) {
                client.peer.send(filter)
            }
        }

        socket.on('backOffer', frontAnswer);
        socket.on('backAnswer', signalAnswer);
        socket.on('sessionActive', sessionActive);
        socket.on('createPeer', makePeer);
        socket.on('disconnected', removePeer)
    })
    .catch(err => document.write(err));

checkboxTheme.addEventListener('click', () => {
        if (checkboxTheme.checked === true) {
            document.body.style.backgroundColor = '#212529'
            if (document.querySelector('#muteText')) {
                document.querySelector('#muteText').style.color = "#fff"
            }

        }
        else {
            document.body.style.backgroundColor = '#fff'
            if (document.querySelector('#muteText')) {
                document.querySelector('#muteText').style.color = "#212529"
            }
        }
    }
);

function createDiv() {
    let div = document.createElement('div');
    div.setAttribute('class', "centered");
    div.id = "muteText";
    div.innerHTML = "Click to Mute/Unmute";
    document.querySelector('#peerDiv').appendChild(div);
    if (checkboxTheme.checked === true) {
        document.querySelector('#muteText').style.color = "#fff";
    }
}