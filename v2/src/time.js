
// module for obtaining the current time bor a button event
// depending on the bpm we are working with,
// we figure out the next grid of possible times and round off the note to that time
// todo, ^ explain this ^

exports.time = function(bpm)
{

   return new Date().getTime()
}

