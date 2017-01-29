var midiConnector = require('midi-launchpad').connect(1);

// new Date().getTime()
var note = { x:0, y:0, time:0 };

var sequence = { notes:[], length:0 };

var sequencer = {
   sequences:[],
   empty:true,
   first:null,
   time:0,
   clear:function(){},
   mute:function(){},
   note:function(btn){
      midiNoteOut(btn)
   },
};

var lp = null;

var main = function()
{
   bindButtonEvents()
}

var midiNoteOut = function(btn)
{

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