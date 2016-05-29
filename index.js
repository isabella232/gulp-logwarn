var es = require('event-stream');
var colors = require('colors');
var PluginError = require('gulp-util').PluginError;
var through = require('through2')

var logWarn = function (subString, opt) {
// Collect all files with errors
  var errorFiles = [],
    finalMessage = null;
  substrings = typeof subString === "undefined" ? [] : subString;
  opt = opt || {};
  var hasError = false;

  function occurrences(file, cb) {

    // file.contents = new Buffer(String(file.contents).toString());
    if (file.isNull()) {
      // Do nothing if no contents
    }

    if (file.isBuffer()) {
      var string = file.contents.toString();
      string = string.toString('utf8').split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
      var message = "";
      var m = 0;
      var n = 0, pos = 0;
      var sc = 0;
      while (sc < string.length) {
        for (var i = substrings.length - 1; i >= 0; i--) {
          var step = substrings[i].length;

          pos = string[sc].indexOf(substrings[i], pos);
          if (pos >= 0) {
            n++;
            message = message + "    " + "[" + (sc + 1) + "] " + substrings[i] + " ,\n";
          }
          ;
        }
        ;
        sc++;
      }
      m = m + n;

      finalMessage = file.path + " (" + m + ")\n" + message;
      if (m === 0) {
        if (opt && opt.logLevel !== 'warn') {
          console.log(finalMessage[opt.color || 'green']);
        }
      } else {
        file.failures = finalMessage;
      }
      message = null;
      cb(null, file);
    }

  }

  return es.map(occurrences);

};


logWarn.report_failures = function () {

  return through.obj(function (chunk, enc, cb) {
    var failures = chunk.failures;
    if (failures) {
      console.log(failures["red"]);
    }
    cb(null, chunk)
  }).on('end',function(){
    return this.emit("error", new PluginError("gulp-logWarn", "you have devil keywords in you code "));
  })
};


module.exports = logWarn;
