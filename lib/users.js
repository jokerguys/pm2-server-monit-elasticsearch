// var pmx     = require('pmx');
var exec = require('./exec.js');

// var Probe = pmx.probe();
var metrics = {};


function refreshMetrics() {

  var usedMemProc = exec('who | grep -v localhost | wc -l', function(err, stdout, stderr) {
    if (err || stderr) {
      metrics.usersConnected.vaue = '0';
    }
    metrics.usersConnected.value = stdout.replace('\n', '').trim();
  });

  setTimeout(function() {
    // console.log(metrics);
  }, 1000)
}

function initMetrics() {
  metrics.usersConnected = {
    name  : 'TTY/SSH opened',
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 15,
      cmp : '>'
    }
  }
}

function init(conf) {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics, conf.small_interval * 1000);
}

module.exports.init = init;
