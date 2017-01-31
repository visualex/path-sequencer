'use strict';
var midiConnector = require('midi-launchpad').connect(1); // 1


var lp = null;

// main app call
var main = function(launchpad)
{
   bindButtonEvents()
   lp = launchpad
}

// one Sequencer
// the Sequencer hasMany Sequences
// Sequence hasMany Notes
// the Sequencer hasMany Buttons
// Button is a Note or Function
class Sequencer
{
   static play(){}
   static stop(){}
   static tapTempo(){}
   static record(){}
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
class Button
{
   constructor(btn)
   {
      // basics
      this.note = null
      this.action = null

      // construct
      this.btn = btn
      if (btn.x < 8 && btn.y < 8) {
         this.note = this.btn.toNote(); // todo check this
      } else {
         this.action = this.setAction()
      }
   }

   setAction()
   {
      if (this.btn.special == 'up,page') {
         return this.actionRecord()
      }

      if (this.btn.special == 'down,page') {
         return this.actionPlay()
      }

      if (this.btn.special == 'left,page') {
         return this.actionStop()
      }
   }

   actionPlay()
   {
      Sequencer.play()
   }

   actionStop()
   {
      Sequencer.stop()
   }

   actionRecord()
   {
      Sequencer.record()
   }

}

// new Date().getTime()




var bindButtonEvents = function()
{
   lp.on('press', function(btn) { handlePress(btn); });
   lp.on('release', function(btn) { handleRelease(btn); });
}

var handlePress = function(btn)
{
   btn.light(lp.colors.red.low)
   debugButton(btn)
}

var handleRelease = function(btn)
{
   btn.light(lp.colors.off)
}

var debugButton(btn)
{
   console.log(
      "Pressed: "+
      "x:"        +btn.x          +", "+
      "y:"        +btn.y          +", "+
      "state:"    +btn.getState() +", "+
      "special:"  +btn.special
   );
}

midiConnector.on("ready", function(launchpad) {
   console.log("the hardware is ready")
   main(lp)
});


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