// var pmx     = require('pmx');
var fs = require('fs');
var exec = require('./exec.js');

// var Probe = pmx.probe();
var metrics = {};


function setMetrics() {
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
        metrics.osRunning.value = resultOs;
      } else if (distribution != null && distribution != '') {
        metrics.osRunning.value = distribution;
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
          metrics.osRunning.value = resultOs;
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
      metrics.osRunning.value = resultOs;
    });
  } else {
    checkLastResort()
  }  

  setTimeout(function() {
    // console.log(metrics);
  }, 1000);
}

function checkLastResort() {
  exec("uname -sr", function(err, out) {
    if (!err && out != '') {
      metrics.osRunning.value = out;
    } else {
      metrics.osRunning.value = '?';
    }
  })
}

function initMetrics() {
  metrics.osRunning = {
    name  : 'Operating System',
    value : 'N/A'
  };
}

function init() {
  initMetrics();
  setMetrics();
}

module.exports.init = init;
