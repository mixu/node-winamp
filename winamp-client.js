var net = require('net');

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
   var buffer = new Buffer(64 * 1024);
   var buffer_start = 0;
   var buffer_end = 0;
   var buffer_cursor = 0;
   var skip = 0;
   var counter = 0;
   this.c.addListener('data', function(data) {
      counter++;
      var temp = 0;
      console.log(counter + "Receive: "+data.length+" skip = "+skip);
      if(skip > data.length) {
         console.log("Autoskipping "+data.length+" bytes of "+skip+".");
         skip -= data.length;
         return;
      }
      // old skip
      if(skip > 0) {
         // copy from the old
         data.copy(buffer, buffer_end, skip);
         console.log("Final skipping "+skip+" bytes of "+skip+".");
         skip -= skip;
      } else {
         // copy the whole data-buffer to the end of the buffer
         data.copy(buffer, buffer_end);
         buffer_end += data.length;
      }
      var pos = bindexOf(buffer_cursor, buffer, 10);
      // accumulate commands
      while (pos >= 0) {
         // read the command
         var cmd = buffer.slice(buffer_cursor, pos).toString('ascii');
         // remove from buffer
         buffer_cursor = pos+1;
         // call the sync function
         if(self.mode == 'wait-sync') {
            skip += synchronize.call(self, cmd);
         } else {
            skip += receive.call(self, cmd);
         }
         // skip binary data
         if(skip > 0) {            
            temp = Math.min(skip, buffer.length);
            buffer_cursor += temp;
            console.log(counter +"Skipping "+temp+" bytes of "+skip+".");
            skip -= temp;
         }
         // check for another command
         pos = bindexOf(buffer_cursor, buffer, 10);
      }
   });   
}

function bindexOf(start, buffer, chr) {
   for(; start < buffer.length; start++) {
      if(buffer[start] == chr) {
         return start;
      }
   }
   return -1;
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
      console.log("COVER length "+cover_length);
      this.step++;
      this.mode = 'receive';
      // cover bitmap must be skipped
      return cover_length;
   }   
   return 0;
}

function receive(cmd) {
   console.log('cmd: '+cmd);
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