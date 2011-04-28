
var RingBuffer = function(buffer_size) {
   this.ring = new Buffer(buffer_size);
   // for clarity
   for(var i = 0; i < this.ring.length; i++) {
      this.ring[i] = 0;
   }
   this.ring_start = 0;
   this.ring_cursor = 0;
   this.content_length = 0;
};

/**
 * Add (copy) another buffer to the ring buffer.
 */
RingBuffer.prototype.add = function(buffer) {
   // adjust the content_length first
   this.content_length += buffer.length;
//   console.log(this.content_length);
   if(this.content_length < 1) {
      // if we have skipped ahead, then just ignore the data until we have some content.
      return;
   }
   if(this.content_length > this.ring.length) {
      // if we go over the ring buffer length, then force skipping the read start position forward
      this.skip(this.content_length - this.ring.length);
   }
   // determine the maximum we can write in a single operation.
   var availableTillEnd = this.ring.length-this.ring_cursor;
   if(availableTillEnd > buffer.length) {
      // can copy the whole buffer, plenty of space
      buffer.copy(this.ring, this.ring_cursor);
      this.ring_cursor += buffer.length;
   } else {
      // not enough space till the end, so fill up until the end and continue from the start
      buffer.copy(this.ring, this.ring_cursor, 0, availableTillEnd);
      // copy the rest
      var remaining = buffer.length-availableTillEnd;
      buffer.copy(this.ring, 0, availableTillEnd, availableTillEnd+remaining);
      this.ring_cursor = availableTillEnd+remaining;
   }
//   console.log('start: '+this.ring_start+' cursor: '+this.ring_cursor + ' len :'+this.content_length);
};

/**
 * Return the ring buffer content as a linear string.
 */
RingBuffer.prototype.toString = function() {
   if(this.content_length < 1) {
      return '';
   }
   if(this.ring_start + this.content_length < this.ring.length) {
      // linear content
      return this.ring.slice(this.ring_start, this.ring_start + this.content_length).toString();
   } else {
      // calculate the number of chars in the first part
      var first_part_size = this.ring.length - this.ring_start;
      // and subtract it from the total content size.
      return this.ring.slice(this.ring_start).toString() + this.ring.slice(0, this.content_length - first_part_size).toString();
   }
};

/**
 * Skip forward. Note: you can skip forward more than you currently have data.
 * This will make the content_lenght become negative, and you will only get a string back when it becomes positive..
 */
RingBuffer.prototype.skip = function(bytes) {
   console.log('Skip '+bytes);
   this.ring_start = (this.ring_start + bytes) % this.ring.length;
   this.content_length -= bytes;
   // if you skip more than is in the buffer:
   if(this.content_length < 1) {
      // indices should be zero, as the whole buffer can be reused...
      this.ring_start = 0;
      this.ring_cursor = 0;
   }
};

RingBuffer.prototype.log = function() {
   console.log(this.ring);
   console.log('('+this.ring.toString()+')');
}

var a = new Buffer("aaaa", 'ascii');
var b = new Buffer("bbbbb", 'ascii');
var c = new Buffer("cc", 'ascii');

var rb = new RingBuffer(10);

// add one item to the buffer
rb.add(a);
console.log(rb.toString());

// add another item to the buffer
rb.add(b);
console.log(rb.toString());

// now force the buffer to go over
rb.add(c);
console.log(rb.toString());

// now skip forward 15 bytes
rb.skip(15);
// e.g. content_lenght is -5

// add 4 characters
rb.add(new Buffer("dddd", 'ascii'));
console.log(rb.toString());
// add 3 characters
rb.add(new Buffer("eee", 'ascii'));
console.log(rb.toString());

// add a buffer that is longer than the ring
rb.add(new Buffer("fffffggggghhhhh", 'ascii'));
console.log(rb.toString());



function parse(buffer) {
   rb.add(buffer);
   var pos = rb.indexOf("\n");

   while(pos >= 0) {
      var cmd = rb.substr(0, pos).toString('ascii');
      rb.skip(pos);
      console.log(cmd);
      // check for another command
      pos = rb.indexOf("\n");
   }
}
/*

var buffer = new Buffer(40);

function init() {
   for(var i = 0; i < buffer.length; i++) {
      buffer[i] = 0;
   }
}

var buffer_max = 0;
var buffer_cursor = 0;
var skip = 0;

function message(input) {
   if(skip > 0) {
      if(skip > input.length) {
        return; 
      } else {
         // skip copy
         input.copy(buffer, buffer_max, skip);
         buffer_max += input.length - skip;   
      }
   } else {
      // full copy
      input.copy(buffer, buffer_max);
      buffer_max += input.length;   
      // console.log(buffer);
   }
   var pos = bindexOf(buffer_cursor, buffer_max, buffer);
   // accumulate commands
   while (pos >= 0) {
      // read the command
      console.log('bc: '+buffer_cursor+' to pos: '+pos);
      var cmd = (buffer.slice(buffer_cursor, pos)).toString('ascii');
      // remove from buffer
      buffer_cursor = pos+1;
      // call the sync function
      console.log('command '+cmd);
      // check for another command
      pos = bindexOf(buffer_cursor, buffer_max, buffer);
      console.log('pos: '+pos);
   }
   // housekeeping - ensure that rest of buffer is copied to the start   
   console.log('bc:'+buffer_cursor+' bm:'+buffer_max);
   buffer.copy(buffer, 0, buffer_cursor, buffer_max);
}

init();
message(a);
message(b);
skip = 8;
message(c);

function bindexOf(start, max, buffer) {
   for(; start < max; start++) {
      if(buffer[start] == 10) {
         return start;
      }
   }
   return -1;
}

//console.log(bindexOf(0, b, 10));

*/