var exec = require('./exec.js');

var metrics = {};
var REFRESH_RATE = 60000;
var diskPattern = /^(\S+)\n?\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\n/mg;

function refreshMetrics(drive, callback) {
  exec('df -kP', function(err, out) {

    if (err || !out || (typeof(out) === 'undefined')) {
      return console.error('Fail: could not retrieve hard drive metrics');
    }

    var total = 0;
    var used = 0;
    var free = 0;

    var lines = parseDfStdout(out);

    for (i = 0; i < lines.length; i++) {
      if(lines[i]['Mounted on'] === drive)
        var disk_info = lines[i];
      if (lines[i]['Mounted on'] === '/')
        var main = lines[i];
    }

    if (typeof(disk_info) === 'undefined') {
      if (typeof(main) === 'undefined')
        return console.error('disk name invalid and / not found');
      else {
        console.error('disk name invalid, using / as default');
        disk_info = main;
      }
    }

    total = Math.ceil(((disk_info['1K-blocks'] || disk_info['1024-blocks']) * 1024)/ Math.pow(1024,2));
    used = Math.ceil(disk_info.Used * 1024 / Math.pow(1024,2));
    free = Math.ceil((disk_info.Available || disk_info.Avail) * 1024 / Math.pow(1024,2));

    var total_gb = (total/1024).toFixed(1);
    var used_gb = (used/1024).toFixed(1);
    var free_gb = (free/1024).toFixed(1);

    var used_pour = (100 * used_gb/total_gb).toFixed(1);
    var free_pour = (100 * free_gb/total_gb).toFixed(1);

    resultUsed = used_gb + 'GB / ' + total_gb + 'GB';
    resultFree = free_pour + '%';

    metrics.result.disk.free.value = resultFree;
    metrics.result.disk.used.value = resultUsed;
  });

  setTimeout(function() {
    callback(null, metrics);
  }, 1000);
}

function initMetrics(task) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.disk = {
        free: {
            value: 'N/A',
            alert : {
                mode : 'threshold-avg',
                value : 10,
                cmp : '<'
            }
        }, 
        used: {
            value: 'N/A'
        }
    };
}

function parseDfStdout(stdout) {
  var dfInfo = [];
  var headline;
  stdout.replace(diskPattern, function() {
    var args = Array.prototype.slice.call(arguments, 1, 7);
    if (arguments[7] === 0) {
      headline = args;
      return;
    }
    dfInfo.push(createDiskInfo(headline, args));
  });

  return dfInfo;
}

function createDiskInfo(headlineArgs, args) {
  var info = {};
  headlineArgs.forEach(function(h, i) {
    info[h] = args[i];
  });
  return info;
}

function init(drive, task, callback) {
  initMetrics(task);

  refreshMetrics(drive, callback);
}

module.exports.init = init;
