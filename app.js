'use strict';
var midiConnector = require('midi-launchpad').connect(1); // 1


var lp = null;
var Seq = null;

// main app call
var main = function(launchpad)
{
   lp = launchpad
   Seq = new Sequencer();
   Seq.main()
}


// one Sequencer
// the Sequencer hasMany Sequences
// Sequence hasMany Notes
// the Sequencer hasMany Buttons
// Button is a Note or Function
class Sequencer
{
   main()
   {
      // boot the buttons
      this.buttons = [];
      for (var i = 0; i < 8; i++) {
         for (var j = 0; j < 8; j++)   {
            var id = ('' + i + '' + j + '')
            this.buttons[id] = new Button(id, lp.getButton(i,j));
         }
      }
   }
   play(){}
   stop(){}
   tapTempo(){}
   record(){}
   press(){}
   release(){}
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
   constructor(id, btn)
   {
      // construct
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

      if (por) {
         this.btn.light(lp.colors.red.low)
      } else {
         this.btn.light(lp.colors.off)
      }


      if (!this.btn.special) {
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


   actionToNote(por, note)
   {
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
      Seq.record(por)
   }

}

// new Date().getTime()


var debugButton = function(btn)
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
   main(launchpad)
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