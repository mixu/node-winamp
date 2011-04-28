

var a = new Buffer("aa\nbb\nccc", 'ascii');
var b = new Buffer("cc\n", 'ascii');
var c = new Buffer("1\n2\n3\n4dddd\neee");
console.log(a);

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