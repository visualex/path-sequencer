'use strict';
var file = require('fs')
try   {
   var kmap = file.readFileSync('kmap.jsona') //.toString();
} catch(e)
{
   console.log(e)
}
console.log(kmap)