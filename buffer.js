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
   if(buffer.length > this.ring.length) {
      var remainder = this.ring.length;
      this.reset();
      this._copy(buffer, buffer.length - remainder, buffer.length);
      this.content_length = remainder;
      return;
   }
   // adjust the content_length first
   this.content_length += buffer.length;
//   console.log(this.content_length);
   if(this.content_length < 1) {
      // if we have skipped ahead, then just ignore the data until we have some content.
      return;
   }
   if(this.content_length > this.ring.length) {
      // if we go over the ring buffer length, then force skipping the read start position forward
      var overage = (this.content_length - this.ring.length);
      this.skip(overage);
   }
   this._copy(buffer, 0, buffer.length);
//   console.log('start: '+this.ring_start+' cursor: '+this.ring_cursor + ' len :'+this.content_length);
};

RingBuffer.prototype._copy = function(buffer, from, to) {
   var copy_length = to-from;
   // determine the maximum we can write in a single operation.
   var availableTillEnd = this.ring.length-this.ring_cursor;
   if(availableTillEnd > copy_length) {
      // can copy the whole buffer, plenty of space
      buffer.copy(this.ring, this.ring_cursor, from, to);
      this.ring_cursor += copy_length;
   } else {
      // not enough space till the end, so fill up until the end and continue from the start
      buffer.copy(this.ring, this.ring_cursor, from, from + availableTillEnd);
      // copy the rest
      var remaining = copy_length-availableTillEnd;
      buffer.copy(this.ring, 0, from + availableTillEnd, from + availableTillEnd+remaining);
      this.ring_cursor = availableTillEnd+remaining;
   }
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
   if(bytes > 0) { 
//      console.log('Skip '+bytes); 
   }
   this.content_length -= bytes;
   // if you skip more than is in the buffer; or if the content is longer than the ring buffer size
   if(this.content_length < 1 || this.content_length > this.ring.length) {
      this.reset();
   } else {
      this.ring_start = (this.ring_start + bytes) % this.ring.length;
   }
};

RingBuffer.prototype.reset = function() {
   // indices should be zero, as the whole buffer can be reused...
   this.ring_start = 0;
   this.ring_cursor = 0;
};

RingBuffer.prototype.log = function() {
   console.log(this.ring);
   console.log('('+this.ring.toString()+')');
}

module.exports = RingBuffer;