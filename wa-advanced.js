var Wa = require('./winamp-client.js');
var client = new Wa(50001, '192.168.1.2');

client.on('connect', function() {
   
   require('tty').setRawMode(true);    
   process.stdin.resume();
   process.stdin.on('keypress', function (chunk, key) {
      switch(chunk) {
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
         case 'h':
         case '?':
            console.log('Commands:');
            console.log("\tz - Previous");
            console.log("\tx - Play");
            console.log("\tc - Pause");
            console.log("\tv - Next");
            console.log("\ts - Shuffle");
            console.log("\tr - Repeat");
            console.log("\tj - Jump");
            break;
         default: 
            process.stdout.write('Get Chunk: ' + chunk + '\n');
       }
     if (key && key.ctrl && key.name == 'c') {
        process.exit();
     }
   });

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
