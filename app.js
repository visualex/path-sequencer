'use strict';
var midiConnector = require('midi-launchpad').connect(1) // 1

var file = require('fs')
var midi = require('midi')
var output = new midi.output()
output.getPortCount()
output.getPortName(0)
output.openVirtualPort('Path Sequencer') // this is only for linux & mac

// on app close
// output.closePort();


var lp = null;
var Seq = null;
var btnconf = null;

// todo add the colors to the btnconf.json as well
var loadButtonConfig = function()
{
   try   {
      var conf = file.readFileSync('btnconf.json').toString();
      btnconf = JSON.parse(conf)
   } catch(e)
   {
      // file not present or bad format, exit
      console.log('configuration file btnconf.json file is missing or is badly formatted, exiting')
      console.log(e)
      process.exit(1)
   }
}


// main app call
var main = function(launchpad)
{
   loadButtonConfig()
   lp = launchpad
   Seq = new Sequencer();
   Seq.main()
}


// one Sequencer
// the Sequencer hasMany Sequences
// Sequence hasMany Notes
// the Sequencer hasMany Notes
// Notes have duration, end time and a Buttons
// Button has Functions
class Sequencer
{
   constructor()
   {
      this.sequences = []
      console.log(['this.sequences', this.sequences])
      this.recording = false
   }
   main()
   {
      // boot the buttons
      this.buttons = [];
      for (var i = 0; i < 9; i++) {
         for (var j = 0; j < 9; j++)   {
            var id = ('' + i + '' + j + '')
            this.buttons[id] = new Button(id, lp.getButton(i,j));
         }
      }
   }
   play(){}
   lastSequence()
   {
      return this.sequences[this.sequences.length-1]
   }
   playLastSequence()
   {
      this.lastSequence().play()
   }
   stop()
   {
      debug('stopping all sequences')
      for (var a in this.sequences) {
         this.sequences[a].notes = []
      }
      this.sequences = []
   }
   tapTempo(){}
   record()
   {
      this.sequences.push(new Sequence())
      if (!this.recording) {
         this.recording = true
      } else {
         this.recording = false
      }
   }
   press(btn)
   {
      if (!this.recording) {
         return
      }

      if (this.lastSequence().isFirstNote(btn)) {
         this.playLastSequence()
      }

      this.lastSequence().addBegin(btn)
   }
   release(btn)
   {
      if (!this.recording) {
         return
      }
      this.lastSequence().addEnd(btn)
   }
}

class Sequence
{
   constructor()
   {
      this.notes = []
      this.recordingNote = null
      this.currentNote = 0
   }
   addBegin(btn)
   {
      if (this.recordingNote !== null) {
         this.recordingNote.len = (new Date().getTime() - this.recordingNote.len);
         this.notes.push(this.recordingNote)
      }
      this.recordingNote = new Note(btn)
      this.recordingNote.len = this.recordingNote.stime = new Date().getTime()
   }
   addEnd(btn)
   {
      this.recordingNote.etime = (new Date().getTime() - this.recordingNote.stime)
   }
   isFirstNote(btn)
   {
      if (!this.notes.length) {
         return false
      }
      if (btn.id === this.notes[0].btn.id) {
         return true
      }
      return false
   }
   clear(){}
   mute(){}
   redouble(){}
   stop()
   {

   }
   play()
   {
      if (this.currentNote >= this.notes.length) {
         this.currentNote = 0
      }

      var curNote = this.notes[this.currentNote]
      var curButton = curNote.btn

      curButton.actionFromSeq(true)

      setTimeout(function(btn){
         btn.actionFromSeq(false)
      }, curNote.etime, curButton)

      setTimeout(function(parent){
         parent.play()
      }, curNote.len, this)

      this.currentNote++
   }
}

class Note
{
   constructor(btn)
   {
      this.btn = btn
      this.len = 0   // total note len
      this.stime = 0
      this.etime = 0 // pressed duration
   }
}

// a map to manage all the physical buttons
// map special buttons to special functions

/*
   todo buttons need to call a new object, buttonController,
   this object needs to understand button combos (2 buttons pressed at the same time)
   from the btnconf.json json file
   this object will also assign the buttons from their colors btnconf.json json file
   and handle their states - mediator pattern
 */
class Button
{
   constructor(id, btn)
   {
      // construct
      this.id = id

      this.specialColor = lp.colors.red.low

      this.specialColorOn = false

      var parent = this

      this.btn = btn

      this.btn.on('press', function(){
         parent.action(true);
      });

      this.btn.on('release', function(){
         parent.action(false);
      });

   }

   action(por)
   {

      if (!this.btn.special) {
         if (por) {
            this.btn.light(lp.colors.red.high)
         } else {
            this.btn.light(lp.colors.off)
         }
         return this.actionToNote(por, this.btn.toNote());
      }

      if (this.btn.special == 'up,page') {
         return this.actionRecord(por)
      }

      if (this.btn.special == 'down,page') {
         return this.actionPlay(por)
      }

      if (this.btn.special == 'left,page') {
         return this.actionStop(por)
      }
   }

   actionFromSeq(por)
   {
      if (por) {
         output.sendMessage([144, this.btn.toNote(), 127]);
         this.btn.light(lp.colors.red.high)
      } else {
         output.sendMessage([128, this.btn.toNote(), 40]);
         this.btn.light(lp.colors.off)
      }
      // console.log(this.btn.toNote())
   }

   actionToNote(por, note)
   {
      if (por) {
         Seq.press(this)
      } else {
         Seq.release(this)
      }
      //
      // todo send midi signal here
      // console.log(note)
   }

   actionPlay(por)
   {
      Seq.play(por)
   }

   actionStop(por)
   {
      Seq.stop(por)
   }

   actionRecord(por)
   {
      if (!por) {
         return; // this button ignores release
      }
      if (this.specialColorOn) {
         this.specialColorOn = false
         this.btn.light(lp.colors.off)
      } else {
         debug('recording')
         this.specialColorOn = true
         this.btn.light(this.specialColor)
      }
      Seq.record()
   }

}

midiConnector.on("ready", function(launchpad) {
   console.log("the hardware is ready")
   main(launchpad)
});

var debugLevel = 1
var debug = function(w)
{
   if (!debugLevel) {
      return
   }
   console.log(w)
}
var debugButton = function(btn)
{
   if (!debugLevel) {
      return
   }
   console.log(
      "Pressed: "+
      "x:"        +btn.x          +", "+
      "y:"        +btn.y          +", "+
      "state:"    +btn.getState() +", "+
      "special:"  +btn.special
   );
}

/*
   Pressed: x:0, y:0, state:1, special:false
   Released: x:0, y:0, state:0, special:false
   Pressed: x:7, y:7, state:1, special:false
   Pressed: x:7, y:7, state:0, special:false

   Pressed: x:0, y:8, state:1, special:up,page
   Pressed: x:1, y:8, state:1, special:down,page
   Pressed: x:2, y:8, state:1, special:left,page
   Pressed: x:3, y:8, state:1, special:right,page
   Pressed: x:4, y:8, state:1, special:session,inst
   Pressed: x:5, y:8, state:1, special:user 1,fx
   Pressed: x:6, y:8, state:1, special:user 2,user
   Pressed: x:7, y:8, state:1, special:mixer,mixer

   Pressed: x:8, y:0, state:1, special:right,vol
   Pressed: x:8, y:1, state:1, special:right,pan
   Pressed: x:8, y:2, state:1, special:right,snd A
   Pressed: x:8, y:3, state:1, special:right,snd B
   Pressed: x:8, y:4, state:1, special:right,stop
   Pressed: x:8, y:5, state:1, special:right,trk on
   Pressed: x:8, y:6, state:1, special:right,solo
   Pressed: x:8, y:7, state:1, special:right,arm
 */

/*

   todo 8 sequences hard limit? last 8th button can be a pager fnx: page sequences, so it can become 7*64 = 448,
   i prefer the number 512, so the fnx could be y1


   basic layout per btnconf.json:

   8 sequences + {arm the sequence, deselect any sequence}
x  * * * * * * * *  y
   n 2 3 4 5 6 7 8  * {fn-play-stop: fn+x play/stop x}
   1 n 3 4 5 6 7 8  * {fn-mute: fn+x = mute sequence, fn+n = mute n }    // mute color yellow
   1 2 n 4 5 6 7 8  * {fn-clear: fn+x = clear sequence, fn+n = clear n}
   1 2 3 n 5 6 7 8  *
   1 2 3 4 n 6 7 8  *
   1 2 3 4 5 n 7 8  *
   1 2 3 4 5 6 n 8  * {fn-redoubles: fn+n = select, }
   1 2 3 4 5 6 7 n  * {tempo blink tappable}
 */