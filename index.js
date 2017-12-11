var fs = require('fs');

const settings = JSON.parse(fs.readFileSync(__dirname + '/settings.json', 'utf8'));
var socket = require('socket.io-client')('http://' + settings.host + ':' + settings.port);
var Omx = require('node-omxplayer');
var player = Omx();

var deltime, action;

socket.on('connect', () => {
    player.newSource(settings.mediapath + 'test.mp4');
    player.pause();
    socket.emit('readytoplay', settings.id);
});

socket.on('timesync', (obj) => {
    deltime = obj.time;
    action = obj.action;
});

socket.on('gettime', (t) => {
    if ((deltime - t) < 0) {
        switch (action) {
            case "play":
                player.play();
                break;
            case "pause":
                player.pause();
                break;
        }
        socket.emit('videostarted');
    }
});