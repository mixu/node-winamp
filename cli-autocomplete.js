

require('tty').setRawMode(true);    
process.stdin.resume();
process.stdin.on('keypress', function (chunk, key) {
  autocomplete(chunk, key);
  if (key && key.ctrl && key.name == 'c') {
     process.exit();
  }
});

var NodeCli = require('./node-cli.js');
var cli = new NodeCli();

// btw, this is not my playlist. It's a random top charts list..
var topchart = [
'Adele - Rolling In The Deep',
'Katy Perry - E.T.',
'Black Eyed Peas - Just Can\'t Get Enough',
'Bruno Mars - The Lazy Song',
'Ke$ha - Blow',
'Tinie Tempah - Written In The Stars',
'Jennifer Lopez - On The Floor',
'Jeremih - Down On Me',
'Chris Brown - Look At Me Now',
'Rihanna - S&M',
'Pitbull - Give Me Everything',
'Lupe Fiasco - The Show Goes On',
'Lady GaGa - Born This Way',
'Selena Gomez & The Scene - Who Says',
'Lady GaGa - Judas',
'Dr. Dre - I Need A Doctor',
'Wiz Khalifa - Roll Up',
'Cee Lo Green - Forget You',
'Britney Spears - Till The World Ends',
'Blake Shelton - Honey Bee',
'New Boyz - Back Seat',
'Avril Lavigne - What The Hell',
'Christina Perri - Jar Of Hearts',
'Kanye West - All Of The Lights',
'Mike Posner - Bow Chicka Wow Wow',
'Script - For The First Time',
'Diddy-Dirty Money - Coming Home',
'Jason Aldean - Dirt Road Anthem',
'Lmfao - Party Rock Anthem',
'T PAIN - Best Love Song',
'Katy Perry - Firework',
'Lil\' Wayne - 6 Foot 7 Foot',
'Jana Kramer - Whiskey',
'Cee Lo Green - F**k You!',
'Adele - Turning Tables',
'Zac Brown Band - Colder Weather',
'Thompson Square - Are You Gonna Kiss Me Or Not',
'Jason Aldean - Don\'t You Wanna Stay',
'Bruno Mars - Grenade',
'Nicki Minaj - Moment 4 Life',
'Pink - Fuckin\' Perfect',
'Rascal Flatts - I Won\'t Let Go',
'Taylor Swift - Mean',
'Keri Hilson - Pretty Girl Rock',
'Pitbull - Hey Baby',
'Usher - More',
'Sara Evans - A Little Bit Stronger',
'Mumford & Sons - The Cave',
'Duck Sauce - Barbra Streisand',
'Mumford & Sons - Little Lion Man',
'Akon - Angel',
'The Band Perry - You Lie',
'Wiz Khalifa - No Sleep',
'Chris Young - Tomorrow',
'Hot Chelle Rae - Tonight, Tonight',
'Florence and the Machine - Dog Days Are Over',
'Miguel - Sure Thing',
'Miranda Lambert - Heart Like Mine',
'Bruno Mars - Just The Way You Are',
'Waka Flocka Flame - No Hands',
'Black Eyed Peas - The Time (the Dirty Bit)',
'Lil\' Wayne - If I Die Today',
'Seether - Country Song',
'The Band Perry - If I Die Young',
'Taio Cruz - Dynamite',
'Train - Marry Me',
'Wiz Khalifa - Black And Yellow',
'Muse - Uprising',
'Enrique Iglesias - Tonight',
'Keith Urban - Without You',
'Colbie Caillat - I Do',
'OneRepublic - Good Life',
'Justin Moore - If Heaven Wasn\'t So Far Away',
'Ronnie Dunn - Bleed Red',
'Eric Church - Homeboy',
'Eli Young Band - Crazy Girl',
'Wiz Khalifa - Say Yeah',
'Ke$ha - We R Who We R',
'Adele - Someone Like You',   
   ];


var current = '';
var selected = 0;
var selected_index = null;

function autocomplete(chunk, key) {
   if(key) {
      if(key.name.length == 1) {
         current += key.name;
      } else if(key.name == 'escape') {
         return -1;
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
}
