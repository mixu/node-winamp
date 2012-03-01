/**
 * Ring buffer implementation for node.js
 * by Mikito Takada.
 * Licenced under the BSD licence.
 *
 * Node.js Winamp client library for the Winamp plugin at http://code.google.com/p/remotecontrol-for-winamp/
 *
 * Allows you to connect via LAN and issue commands to the plugin server.
 *
 * All the usual suspects are implemented, but handling queueing is currently missing.
 * Other than that, you can control pretty much everything via this client library.
 *
 */
var net = require('net'),
    Buffers = require('buffers'),
    EventEmitter = require('events').EventEmitter;

var separator = new Buffer('\n');

function Wa(port, ip) {
   var self = this;
   // mode for reading up the sync
   this.mode = 'wait-sync';
   // step in the sync process
   this.step = 0;
   // playlist length
   this.playlist_expected_length = 0;
   this.playlist_data = [];

   this.c = net.createConnection(port, ip);
   this.c.addListener('connect', function() {
      self.emit('connect');
   });
   // simple string buffer
   var rb = new Buffers();
   var counter = 0;
   this.c.addListener('data', function(data) {
      counter++;
      rb.push(data);
      var pos = rb.indexOf(separator);
      // accumulate commands
      while (pos >= 0) {
         // read the command and remove from buffer
         var cmd = rb.splice(0, pos+1).toString().trim();
         // call the sync function
         if(self.mode == 'wait-sync') {
            rb.splice(0, synchronize.call(self, cmd));
         } else {
            rb.splice(0, receive.call(self, cmd));
         }
         // check for another command
         pos = rb.indexOf(separator);
      }
   });
}

// extend EventEmitter
Wa.prototype = new EventEmitter();

function synchronize(cmd) {

  switch(this.step) {
    case 0:
      // first returned item is the number of tracks in the playlist
      this.playlist_expected_length = cmd;
      this.step++;
      break;
    case 1:
      // then comes the playlist (item count should match the number of tracks)
      this.playlist_data.push(cmd);
      if(this.playlist_data.length == this.playlist_expected_length) {
         this.step++;
         this.emit('playlist', this.playlist_data);
      }
      break;
    case 2:
      // then comes the repeat status (1 / 0)
      this.emit('repeat', (cmd == '1'));
      this.step++;
      break;
    case 3:
      // then comes the shuffle status (1 / 0)
      this.emit('shuffle', (cmd == '1'));
      this.step++;
      break;
    case 4:
      // then comes the volume (0 - 255?)
      this.emit('volume', cmd);
      this.step++;
      break;
    case 5:
      // then the queue list count
      this.step++;
      if(cmd == '0') {
         this.step++;
      }
      break;
    case 6:
      // then the queue list elements (skipped ??)
      this.step++;
      break;
    case 7:
      // then the sample rate
      this.emit('samplerate', cmd);
      this.step++;
      break;
    case 8:
      // then the bit rate
      this.emit('bitrate', cmd);
      this.step++;
      break;
    case 9:
      // then the length (in seconds!)
      this.emit('length', cmd);
      this.step++;
      break;
    case 10:
      // then the playlist position
      this.emit('position', cmd);
      this.step++;
      break;
    case 11:
      // then the title
      this.emit('title', cmd);
      this.step++;
      break;
    case 12:
      // then the playback status
      this.emit('playback', cmd);
      this.step++;
      break;
    case 13:
      // then the cover (bitmap) -- is it enabled?
      if(cmd == '0') {
         // no cover, all done
         this.step = 14;
         this.mode = 'receive';
      } else {
         this.step++;
      }
      break;
    case 14:
      // cover length
      var cover_length = parseInt(cmd.substring(12), 10);
      // console.log("COVER length ", cover_length);
      this.step++;
      this.mode = 'receive';
      // cover bitmap must be skipped
      return cover_length;
  }

  return 0;
}

function receive(cmd) {

   var commands = [
      // isplaying_ (0 not playing / 1 playing  / 3 paused)
      { msg: 'isplaying_', emit: 'playback', hasParam: true },
      // playlistPosition_ (number)
      { msg: 'playlistPosition_', emit: 'position', hasParam: true },
      // samplerate_ (number)
      { msg: 'samplerate_', emit: 'samplerate', hasParam: true },
      // bitrate_ (number)
      { msg: 'bitrate_', emit: 'bitrate', hasParam: true },
      // length_ (number ???)
      { msg: 'length_', emit: 'length', hasParam: true },
      // title_ (string)
      { msg: 'title_', emit: 'title', hasParam: true },
      // stop (nothing else) = stopped
      { msg: 'stop', emit: 'stop', hasParam: false },
      // pause
      { msg: 'pause', emit: 'pause', hasParam: false },
      // shuffle_ (0 / 1)
      { msg: 'shuffle_', emit: 'shuffle', hasParam: true },
      // repeat_ (0 / 1)
      { msg: 'repeat_', emit: 'repeat', hasParam: true },
      // volume_ (0 - 255)
      { msg: 'volume_', emit: 'volume', hasParam: true },
      // progress_ (number)
      { msg: 'progress_', emit: 'progress', hasParam: true },
      // queue_next
      { msg: 'queue_next', emit: 'queue_next', hasParam: false },
   ];
   for(var i = 0; i < commands.length; i++) {
      if(cmd.substr(0, commands[i].msg.length) == commands[i].msg) {
         if(commands[i].hasParam) {
            this.emit(commands[i].emit, cmd.substr(commands[i].msg.length));
         } else {
            this.emit(commands[i].emit);
         }
      }
   }
   if(cmd.substr(0, 'coverLength_0'.length) == 'coverLength_0') {
      // do nothing
   } else if(cmd.substr(0, 'coverLength_'.length) == 'coverLength_') {
      // coverLength_
        // length
        // cover
      return cmd.substr('coverLength_'.length);
   }
   return 0;
}

/**
 * Simple socket write.
 */
Wa.prototype.write = function (text) {
   this.c.write(text);
};

Wa.prototype.end = function() {
   this.c.end();
}

/**
 * Playlist control functions
 */
Wa.prototype.previous = function () {
   this.write('previous');
}
Wa.prototype.play = function () {
   this.write('play');
}

Wa.prototype.pause = function () {
   this.write('pause');
}

Wa.prototype.stop = function () {
   this.write('stop');
}

Wa.prototype.next = function() {
   this.write('next');
}

Wa.prototype.shuffle = function () {
   this.write('shuffle');
}

Wa.prototype.repeat = function () {
   this.write('repeat');
}

Wa.prototype.playlist = function (position) {
   this.write('playlistitem_'+position);
}

Wa.prototype.progress = function (milliseconds) {
   this.write('progress_'+milliseconds);
}

Wa.prototype.volume = function (volume) {
   if(volume > 255) {
      volume = 255;
   } else if(volume < 0) {
      volume = 0;
   }
   this.write('volume_'+volume);
}

Wa.prototype.mute = function () {
  this.write('mute');
}

module.exports = Wa;
