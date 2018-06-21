var fs = require('fs');
var exec = require('./exec.js');

var metrics = {};


function setMetrics(callback) {
  if (process.platform == 'linux') {
    //Debian, Ubuntu, CentOS
    fs.readFile("/etc/issue", function(err, out) {
      if (err) {
        return checkLastResort();
      }
      out = out.toString()
      var version = out.match(/[\d]+(\.[\d][\d]?)?/);
      if (version != null)
      version = version[0];
      var distribution = out.match(/[\w]*/)[0];
      if (version != null && distribution != null) {
        var resultOs = distribution + ' ' + version;
        metrics.result.os.value = resultOs;
      } else if (distribution != null && distribution != '') {
        metrics.result.os.value = distribution;
      } else if (version == null) {
        fs.readFile("/etc/redhat-release", function(err, out) {
          if (err) {
            return checkLastResort();
          }
          out = out.toString();
          version = out.match(/[\d]+(\.[\d][\d]?)?/);
          if (version != null)
          version = version[0];
          var resultOs = 'Red Hat ' + version;
          metrics.result.os.value = resultOs;
        });
      }
    });
  } else if (process.platform == 'darwin') {
    exec("sw_vers", function(err, out) {
      if (err) {
        return checkLastResort();
      }
      var version = out.match(/[\n\r].*ProductVersion:\s*([^\n\r]*)/)[1];
      var distribution = out.match(/.*ProductName:\s*([^\n\r]*)/)[1];
      var resultOs = distribution + ' ' + version;
      metrics.result.os.value = resultOs;
    });
  } else {
    checkLastResort()
  }  

  setTimeout(function() {
    callback(null, metrics);
  }, 1000);
}

function checkLastResort() {
  exec("uname -sr", function(err, out) {
    if (!err && out != '') {
        metrics.result.os.value = out;
    } else {
        metrics.result.os.value = '?';
    }
  })
}

function initMetrics(task) {
  metrics.tag = task;
  metrics.result = {};
  metrics.result.os = {
    value : 'N/A'
  };
}

function init(task, callback) {
  initMetrics(task);
  setMetrics(callback);
}

module.exports.init = init;
