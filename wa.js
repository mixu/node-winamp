var net = require('net');
var rl = require('readline');

var c = net.createConnection(50000, '192.168.1.2');

function write(c, text) {
  c.write(text);
  c.flush(); 
}

function next(c) {
  write(c, 'next');
}

function prev(c) {
  write(c, 'previous');
}

function shuffle(c) {
  write(c, 'shuffle');
}

function play(c) {
  write(c, 'play');
}

function pause(c) {
  write(c, 'pause');
}

function repeat(c) {
  write(c, 'repeat');
}

function mute(c) {
  write(c, 'mute');
}

function volume(c, volume) {
  var vol = ((volume > 255 || volume < 0) ? 128 : volume);
  write(c, 'volume_'+vol);
}

function progress(c, milliseconds) {
  write(c, 'progress_'+milliseconds);
}

function playlist(c, position) {
  write(c, 'playlistitem_'+position);
}

c.addListener('connect', function() {
  console.log('connected');
  var r = rl.createInterface(process.stdin, process.stdout);
  r.on('line', function(cmd) { 
    write(c, cmd); 
  });
});

c.addListener('data', function(data) {
   // first returned item is the number of tracks in the playlist
   console.log(data.toString());
   // then comes the playlist (item count should match the number of tracks)
   // then comes the repeat status (1 / 0)
   // then comes the shuffle status (1 / 0)
   // then comes the volume (0 - 255?)
   // then the queue list count
   // then the queue list elements (skipped ??)
   // then the sample rate
   // then the bit rate
   // then the length
   // then the playlist position
   // then the playback status
   // then the cover (bitmap)
     // length
     // cover bitmap??
});

function synchronize() {

}

function receive() {
   // isplaying_ (0 not playing / 1 playing  / 3 paused)
   // playlistPosition_ (number)
   // samplerate_ (number)
   // bitrate_ (number)
   // length_ (number ???)
   // title_ (string)
   // stop (nothing else) = stopped
   // coverLength_
     // length
     // cover
   // pause
   // shuffle_ (0 / 1) 
   // repeat_ (0 / 1)
   // volume_ (0 / 1)
   // progress_ (number)
   // queue_next
}


