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
   this.playlist = [];

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
      this.playlist.push(cmd);
      if(this.playlist.length == this.playlist_expected_length) {
         this.step++;
         this.emit('playlist', this.playlist);
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
   if(this.step < 14) {
//      console.log(cmd);      
   }
   
   return 0;
}

function receive(cmd) {   
   if(cmd.substr(0, 'isplaying_'.length) == 'isplaying_') {
      // isplaying_ (0 not playing / 1 playing  / 3 paused)
      this.emit('playback', cmd.substr('isplaying_'.length));
   } else if(cmd.substr(0, 'playlistPosition_'.length) == 'playlistPosition_') {
      // playlistPosition_ (number)
      this.emit('position', cmd.substr('playlistPosition_'.length));
   } else if(cmd.substr(0, 'samplerate_'.length) == 'samplerate_') {
      // samplerate_ (number)
      this.emit('samplerate', cmd.substr('samplerate_'.length));
   } else if(cmd.substr(0, 'bitrate_'.length) == 'bitrate_') {
      // bitrate_ (number)
      this.emit('bitrate', cmd.substr('bitrate_'.length));
   } else if(cmd.substr(0, 'length_'.length) == 'length_') {
      // length_ (number ???)
      this.emit('length', cmd.substr('length_'.length));
   } else if(cmd.substr(0, 'title_'.length) == 'title_') {
      // title_ (string)
      this.emit('title', cmd.substr('title_'.length));
   } else if(cmd.substr(0, 'stop'.length) == 'stop') {
      // stop (nothing else) = stopped
      this.emit('stop');
   } else if(cmd.substr(0, 'coverLength_'.length) == 'coverLength_') {
      // coverLength_
      return cmd.substr('coverLength_'.length);
        // length
        // cover
   } else if(cmd.substr(0, 'pause'.length) == 'pause') {
      // pause
      this.emit('pause');
   } else if(cmd.substr(0, 'shuffle_'.length) == 'shuffle_') {
      // shuffle_ (0 / 1) 
      this.emit('shuffle', cmd.substr('shuffle_'.length));
   } else if(cmd.substr(0, 'repeat_'.length) == 'repeat_') {
      // repeat_ (0 / 1)
      this.emit('repeat', cmd.substr('repeat_'.length));
   } else if(cmd.substr(0, 'volume_'.length) == 'volume_') {
      // volume_ (0 - 255)
      this.emit('volume', cmd.substr('volume_'.length));
   } else if(cmd.substr(0, 'progress_'.length) == 'progress_') {
      // progress_ (number)
      this.emit('progress', cmd.substr('progress'.length));
   } else if(cmd.substr(0, 'queue_next'.length) == 'queue_next') {
      // queue_next
      this.emit('queue_next');
   } else {
      console.log('unknown: '+cmd);
   }
   return 0;
}

/**
 * Simple socket write.
 */
Wa.prototype.write = function (text) {
   console.log(text+"\n");
   this.c.write(text);
   this.c.flush(); 
};

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
   var vol = ((volume > 255 || volume < 0) ? 128 : volume);
   this.write('volume_'+vol);
}

Wa.prototype.mute = function () {
  this.write('mute');
}

module.exports = Wa;