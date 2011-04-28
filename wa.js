var rl = require('readline');
var Wa = require('./winamp-client.js');
var client = new Wa(50001, '192.168.1.2');

client.on('connect', function() {
//  console.log('connected');   
   var r = rl.createInterface(process.stdin, process.stdout, completer);
   r.on('line', function(cmd) { 
      switch(cmd) {
         case 'z':
            client.previous();
            break;
         case 'x':
            client.play();
            break;
         case 'c':
            client.pause();
            break;
         case 'v':
            client.stop();
            break;
         case 'b':
            client.next();
            break;
         case 's':
            client.shuffle();
            break;
         case 'r':
            client.repeat();
            break;
         default:
            client.write(cmd); 
      }
   });   
//   r.setPrompt('>', 1);
});

client.on('playlist', function(playlist) {
   console.log('Received playlist of length: '+playlist.length);
});

client.on('title', function (title) {
   console.log('Title: '+title);
});

client.on('repeat', function (title) {
   console.log('Repeat status: '+title);
});

client.on('shuffle', function (title) {
   console.log('Shuffle status: '+title);
});

client.on('volume', function (title) {
   console.log('Volume: '+title);
});

client.on('samplerate', function (title) {
   console.log('Sample rate: '+title);
});

client.on('bitrate', function (title) {
   console.log('Bit rate: '+title);
});

client.on('length', function (title) {
   console.log('Lenght: '+title);
});

client.on('position', function (title) {
   console.log('Position: '+title);
});

client.on('playback', function (title) {
   console.log('Playback: '+title);
});

client.on('stop', function () {
   console.log('Stopped playback');
});

client.on('pause', function () {
   console.log('Pause');
});

client.on('progress', function (title) {
   console.log('Progress: '+title);
});

client.on('queue_next', function () {
   console.log('queue_next');
});


function completer(line) {
  var completes = ['previous', 'play', 'pause', 'stop', 'next', 'shuffle', 'repeat', 'playlistitem_', 'progress_', 'volume_', 'mute' ];
  return [ completes.filter(function(element) {return element.substr(0, line.length) === line}), line];
}
