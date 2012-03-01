/**
 * More fancy console application for controlling Winamp over LAN.
 * by Mikito Takada.
 * Licenced under the BSD licence.
 *
 * A console application which uses the node-winamp library to control Winamp.
 *
 * Interaction is more fluid, since this app supports the zxcvb keyboard controls for
 * playback, has a dedicated jump mode with search and autocomplete and so on.
 *
 * It's still a bit on the ugly side, but I am happy that I can just switch to another
 * terminal and press j + song name + enter to change tracks...
 *
 * A more fancy app would use the event emitter capability of the node-winamp library to
 * display a "persistent" rather than scrolling interface. Give it a go!
 *
 */
var Wa = require('./lib/winamp-client.js');
var client = new Wa(process.argv[3] || 50001, process.argv[2] || '192.168.1.2');
// UI:
var NodeCli = require('./lib/node-cli.js');
var cli = new NodeCli();
var current = '';
var selected = 0;
var selected_index = -1;
var current_volume = 0;

client.on('connect', function() {
   var jump_mode = false;
   process.stdin.resume();
   require('tty').setRawMode(true);
   process.stdin.on('keypress', function (chunk, key) {
      if (key && key.ctrl && key.name == 'c') {
         client.end();
         process.exit();
         return;
      }
      if(jump_mode) {
         var track = autocomplete(chunk, key);
         if(track > -1) {
            client.playlist(track);
            jump_mode = false;
            cli.clear();
         } else if(track == -2) {
            jump_mode = false;
            cli.clear();
         }
      } else if(key) {
         switch(key.name) {
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
            case 'j':
               jump_mode = true;
               current = '';
               selected = 0;
               selected_index = -1;
               console.log('? ');
               break;
            case 'up':
               current_volume += 25;
               client.volume(current_volume);
               break;
            case 'down':
               current_volume -= 25;
               client.volume(current_volume);
               break;
            case 'h':
            case '?':
            default:
               console.log('Commands:');
               console.log("\tz - Previous");
               console.log("\tx - Play");
               console.log("\tc - Pause");
               console.log("\tv - Next");
               console.log("\ts - Shuffle");
               console.log("\tr - Repeat");
               console.log("\tj - Jump");
               console.log("\tup - Volume up");
               console.log("\tdown - Volume down");
               break;
          }
       }
   });

});

var topchart = [];
client.on('playlist', function(playlist) {
   console.log('Received playlist of length: '+playlist.length);
   topchart = playlist;
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
   current_volume = parseInt(title, 10);
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

function autocomplete(chunk, key) {
   if(key) {
      if(key.name.length == 1) {
         current += key.name;
      } else if(key.name == 'escape') {
         return -2;
      } else if(key.name == 'enter') {
         return selected_index;
      } else if(key.name == 'down') {
         selected++;
      } else if(key.name == 'up') {
         selected--;
      } else if(key.name == 'space') {
         current += ' ';
      } else if(key.name == 'backspace') {
         current = current.substr(0, current.length-1);
      }
      if(selected > showed-1) {
         selected = showed-1;
      }
      if(selected < 0) {
         selected = 0;
      }
      if(current == '') {
         selected_index = selected;
      }
      cli.clear()
         .up(1)
         .write("? "+current+"\n")
         .write("*********************************\n");

      var showed = 0;
      var search = current.split(" ").filter(function(element){return element.length > 0;});
      var matches = [];
      for(var i = 0; i < topchart.length; i++) {
         matches = [];
         for(var j = 0; j < search.length; j++) {
            var pos = topchart[i].toLowerCase().indexOf(search[j]);
            if( pos > -1) {
               matches.push(pos);
            } else {
              break;
            }
         }
         if(matches.length == search.length) {
            var from = 0;
            for(var j = 0; j < matches.length; j++) {
               cli.color('white', (showed == selected));
               cli.write(topchart[i].substring(from, matches[j]));
               from = matches[j];
               if(showed == selected) {
                  selected_index = i;
                  cli.color('red', true);
               } else {
                  cli.color('yellow', false);
               }
               cli.write(topchart[i].substring(from, from+search[j].length));
               from += search[j].length;
            }
            cli.color('white', (showed == selected));
            cli.write(topchart[i].substring(from)+"\n");
            cli.color('white');
            showed++;
            if(showed == 5) {
               break;
            }
         } else {
            continue;
         }
      }
   }
   return -1;
}
