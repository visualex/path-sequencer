'use strict';
var midiConnector = require('midi-launchpad').connect(0); // 1

// launchpad abbreviated
var lp = null;

// main app call
var main = function()
{
   bindButtonEvents()
}

// one Sequencer
// the Sequencer hasMany Sequences
// Sequence hasMany Notes
// the Sequencer hasMany Buttons
// Button is a Note or Function
class Sequencer
{
   constructor(){}
   play(){}
   stop(){}
   tapTempo(){}
   record(){}
   note(){}
}

class Sequence
{
   add(){}
   clear(){}
   mute(){}
   redouble(){}
}


// a map to manage all the physical buttons
// map special buttons to special functions
class Buttons
{

   constructor()
   {
      this.noteMap = Map[];
      for (var i = 0; i < 8; i++) {
         this.noteMap['0'+i] = new Button();
      }
   }
}

class Button
{

}

// new Date().getTime()
class Note
{
   constructor(x, y, t)
   {
      this.x = x;
      this.y = y;
      this.t = t;
   }
   clear(){}
   mute(){}
   redouble(){} // redouble the note
}



var bindButtonEvents = function()
{

   lp.on("press", function(btn) {
     handlePress(btn)
     console.log("Pressed: "+
         "x:"        +btn.x          +", "+
         "y:"        +btn.y          +", "+
         "state:"    +btn.getState() +", "+
         "special:"  +btn.special
     );
   });

   lp.on("release", function(btn) {
     handleRelease(btn)
     console.log("Pressed: "+
         "x:"        +btn.x          +", "+
         "y:"        +btn.y          +", "+
         "state:"    +btn.getState() +", "+
         "special:"  +btn.special
     );
   });
}

var handlePress = function(btn)
{
   btn.light(lp.colors.red.low)
}

var handleRelease = function(btn)
{
   btn.light(lp.colors.off)
}

midiConnector.on("ready", function(launchpad) {
   console.log("the hardware is ready")
   lp = launchpad
   main()
});


