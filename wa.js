var rl = require('readline');
var Wa = require('./winamp-client.js');
var client = new Wa(50000, '192.168.1.2');

client.on('connect', function() {
  console.log('connected');   
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
   r.setPrompt('>', 1);
});

client.on('playlist', function(playlist) {
   console.log('Received playlist of length: '+playlist.length);
});

client.on('title', function (title) {
   console.log('Title: '+title);
});

function completer(line) {
  var completes = ['previous', 'play', 'pause', 'stop', 'next', 'shuffle', 'repeat', 'playlistitem_', 'progress_', 'volume_', 'mute' ];
  return [ completes.filter(function(element) {return element.substr(0, line.length) === line}), line];
}
