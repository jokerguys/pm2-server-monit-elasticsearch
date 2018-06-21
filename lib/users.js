var exec = require('./exec.js');

var metrics = {};


function refreshMetrics(callback) {

  var usedMemProc = exec('who | grep -v localhost | wc -l', function(err, stdout, stderr) {
    if (err || stderr) {
        metrics.result.users.value = '0';
    }
    metrics.result.users.value = stdout.replace('\n', '').trim();
  });

  setTimeout(function() {
    callback(null, metrics);
  }, 1000)
}

function initMetrics(task) {
  metrics.tag = task;
  metrics.result = {};
  metrics.result.users = {
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 15,
      cmp : '>'
    }
  }
}

function init(task, callback) {
  initMetrics(task);

  refreshMetrics(callback);
}

module.exports.init = init;
