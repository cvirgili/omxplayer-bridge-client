const fs = require('fs');
const settings = JSON.parse(fs.readFileSync(__dirname + '/settings.json', 'utf8'));
console.log(JSON.stringify(settings,null,1));

const Omx = require('node-omxplayer');
const player = Omx('--blank');
const socket = require('socket.io-client')('http://' + settings.host + ':' + settings.port);

var deltime, action,isgettime=false;

player.on('error',(err)=>{console.log('PLAYER ERROR: '+err);});

socket.on('connect', () => {
    console.log('connected');
});

socket.on('setvideo',(videopath)=>{
    player.newSource(
        'http://' + settings.host + ':' + settings.port+'/static/'+videopath+'/'+settings.id+'.mp4',
        'hdmi',
        false,
        1,
        128
    );
    player.pause();
    socket.emit('ready',settings.id);
    socket.emit('readytoplay',settings.id);
});

socket.on('timesync', (obj) => {
    isgettime=true;
    deltime = obj.time;
    action = obj.action;
});

socket.on('stop',()=>{
    player.newSource('--blank');
    console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ STOP');
});

socket.on('gettime', (t) => {
    if(!isgettime) return;
    if ((deltime - t) < 0) {
        isgettime=false;
        socket.emit('videostarted');
        switch (action) {
            case "play":
                player.play();
                console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ PLAY');
                break;
            case "pause":
                player.pause();
                console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ PAUSE');
                break;
        }
    }
});
socket.on('close',()=>{
    player.quit();
});
socket.on('error',()=>{
    player.quit();
});
socket.on('disconnect',()=>{
    socket.close();
});
socket.on('reload',()=>{
    player.newSource('--blank');
});