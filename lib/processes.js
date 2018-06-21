var os = require('os');
var cp = require('child_process');
var exec = require('./exec.js');

var metrics = {};

function refreshMetrics(callback) {
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", function(err, out) {
        if (err || !out) {
            if (os.platform() == 'darwin') {
                var nb = cp.execSync('ps -A').toString();
                nb = nb.split('\n');
                metrics.result.processes.live.value = nb.length - 1;
                return;
            }
            metrics.result.processes.live.value = '0';
            return;
        }
        var result_proc = (out.split('\n')).length-1;
        metrics.result.processes.live.value = result_proc;
    });

    exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", function(err, out, stderr) {
        if (err || stderr) {
            metrics.result.processes.zombie.value = '0';
            return;
        }
        var result_zombie = (out.split('\n')).length-1;
        metrics.result.processes.zombie.value = result_zombie;
    });

    setTimeout(function() {
        callback(null, metrics);
    }, 1000)
}

function initMetrics(task) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.processes = {}
    metrics.result.processes.live = {
        value : 'N/A'
    }

    metrics.result.processes.zombie = {
        value : 'N/A',
        alert : {
            mode : 'threshold-avg',
            value : 10,
            cmp : '>'
        }
    }
}

function init(task, callback) {
    initMetrics(task);

    refreshMetrics(callback);
}

module.exports.init = init;
