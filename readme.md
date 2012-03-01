
# node-winamp

Node.js client application and bindings for remote controlling Winamp over LAN.

Thank you Martin Schlodinski for releasing the Winamp plugin needed to control playback as open source! Get his app from the Android App Market, it's awesome:

https://market.android.com/details?id=com.RemoteControl

*New* Updated to work with RemoteControl for Winamp version 1.00 and to use substack's Buffers.

##Getting started

You need to use Winamp 5.5+ and install the remote control plugin from:

http://code.google.com/p/remotecontrol-for-winamp/

After installing, you can configure the server port in Winamp.

Run the client using:

node wa-advanced.js [ip] [port]

##Screenshots

Playback interface:

![screenshot](https://github.com/mixu/node-winamp/raw/master/lib/playback.png)

Jump to with autocompletion and song selection using up/down/enter keys:

![screenshot](https://github.com/mixu/node-winamp/raw/master/lib/jump_mode.png)

##Features

There are two console clients - the better one is wa-advanced.js; it works using the same keyboard shortcuts as WinAmp:

* z - Previous
* x - Play
* c - Pause
* v - Next
* s - Shuffle toggle
* r - Repeat toggle
* j - Jump
* up - Volume up
* down - Volume down

The jump mode for wa-advanced.js supports:

* Autocompletion of tracks (just like the jump dialog in Winamp).
* Keyboard selection among the autocompleted tracks.

##Potential improvements

Feel free to improve upon the current client! It works well enough for me thanks to the jump functionality - but the UI could be improved.

The underlying winamp-client library is an EventEmitter, so you just have to react to the various events and update the UI accordingly.

##Licence (Simplified BSD licence)

Copyright 2011 Mikito Takada. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY MIKITO TAKADA ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MIKITO TAKADA OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the authors and should not be interpreted as representing official policies, either expressed or implied, of Mikito Takada.

Not that I have any official policies.
