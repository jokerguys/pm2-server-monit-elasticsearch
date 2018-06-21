var fs = require('fs');

var metrics = {};

function refreshMetrics(callback) {
  fs.readFile('/proc/sys/fs/file-nr', function(err, out) {
    if (err) {
      metrics.result.open_files.value = '0';
      return;
    }
    out = out.toString()
    var result = out.replace(/\n/g, "").split(' ')[0];
    result = parseInt(result);
    metrics.result.open_files.value = result;

  });

  setTimeout(function() {
    callback(null, metrics);
  }, 1000)
}

function initMetrics(task) {
  metrics.tag = task;
  metrics.result = {};
  metrics.result.open_files = {
    value: 'N/A'
  };
}

function init(task, callback) {
  initMetrics(task);

  refreshMetrics(callback);
}

module.exports.init = init;
