# path-sequencer
Midi Sequencer for the Novation Launchpad


## V3 -- todo

Keymapping
   function keys are mapped to functions
   mutitouch functions: fn1+key = fn1function
BPM with Taptempo & MidiSync with DAW / Live
Precision Parameter ?
Cleaner Code
Muting of Notes

## V2 -- todo
Record and playback with the same button. == ignore the first note, this is not comfortable. 
Rest are function buttons like mute, clear, redoubles. 


## V1
Simple proof of cancept, allows layering
of infinite sequences with undo.


one Sequencer
the Sequencer hasMany Sequences, layered, ctrz
Sequence hasMany Notes
the Sequencer hasMany Buttons
Button is a Note or Function


## check
https://www.npmjs.com/package/bpm
