var net = require('net');
var RingBuffer = require('./buffer.js');

var EventEmitter = require('events').EventEmitter;

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
   var rb = new RingBuffer(64 * 1024);
   var counter = 0;
   this.c.addListener('data', function(data) {
      counter++;
//      console.log(counter + "Receive: "+data.length);
      rb.add(data);
      var str = rb.toString();
      if(str == '') {
         return;
      }      
      var pos = str.indexOf("\n");
      // accumulate commands
      while (pos >= 0) {
         // read the command
         var cmd = str.substr(0, pos);
         // remove from buffer
         rb.skip(pos+1);
         // call the sync function
         if(self.mode == 'wait-sync') {
            rb.skip(synchronize.call(self, cmd));
         } else {
            rb.skip(receive.call(self, cmd));
         }
         // check for another command
         str = rb.toString();
         pos = str.indexOf("\n");
      }
   });   
}

// extend EventEmitter
Wa.prototype = new EventEmitter();

function synchronize(cmd) {
   if(this.step == 0) {
      // first returned item is the number of tracks in the playlist
      this.playlist_expected_length = cmd;
      this.step++;  
   } else if(this.step == 1) {            
      // then comes the playlist (item count should match the number of tracks)
      this.playlist_data.push(cmd);
      if(this.playlist_data.length == this.playlist_expected_length) {
         this.step++;
         this.emit('playlist', this.playlist_data);
      }
   } else if(this.step == 2) {
      // then comes the repeat status (1 / 0)
      this.emit('repeat', (cmd == '1'));
      this.step++;
   } else if(this.step == 3) {
      // then comes the shuffle status (1 / 0)
      this.emit('shuffle', (cmd == '1'));
      this.step++;
   } else if(this.step == 4) {
      // then comes the volume (0 - 255?)
      this.emit('volume', cmd);
      this.step++;
   } else if(this.step == 4) {
      // then the queue list count
      this.step++;
      if(cmd == '0') {
         this.step++;         
      }
   } else if(this.step == 5) {
      // then the queue list elements (skipped ??)
      this.step++;
   } else if(this.step == 6) {
      // then the sample rate
      this.emit('samplerate', cmd);
      this.step++;
   } else if(this.step == 7) {
      // then the bit rate
      this.emit('bitrate', cmd);
      this.step++;
   } else if(this.step == 8) {
      // then the length (in seconds!)
      this.emit('length', cmd);
      this.step++;
   } else if(this.step == 9) {
      // then the playlist position
      this.emit('position', cmd);
      this.step++;
   } else if(this.step == 10) {
      // then the title
      this.emit('title', cmd);
      this.step++;
   } else if(this.step == 11) {
      // then the playback status
      this.emit('playback', cmd);
      this.step++;
   } else if(this.step == 12) {      
      // then the cover (bitmap) -- is it enabled?
      if(cmd == '0') {
         // no cover, all done
         this.step = 14;
         this.mode = 'receive';
      } else {
         this.step++;
      }
   } else if(this.step == 13) {      
      // cover length
      var cover_length = parseInt(cmd.substring(12), 10);
//      console.log("COVER length "+cover_length);
      this.step++;
      this.mode = 'receive';
      // cover bitmap must be skipped
      return cover_length;
   }   
//   if(this.step < 14) {
//      console.log(cmd);      
//   }
   
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
   this.c.flush(); 
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