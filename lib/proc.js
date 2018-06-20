// var pmx = require('pmx');
var os = require('os');
var cp = require('child_process');
var exec = require('./exec.js');

var metrics = {};
// var Probe = pmx.probe();

function refreshMetrics() {
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", function(err, out) {
        if (err || !out) {
            if (os.platform() == 'darwin') {
                var nb = cp.execSync('ps -A').toString();
                nb = nb.split('\n');
                metrics.procRunning.value = nb.length - 1;
                return;
            }
            metrics.procRunning.value = '0';
            return;
        }
        var result_proc = (out.split('\n')).length-1;
        metrics.procRunning.value = result_proc;
    });

    exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", function(err, out, stderr) {
        if (err || stderr) {
            metrics.procZombie.value = '0';
            return;
        }
        var result_zombie = (out.split('\n')).length-1;
        metrics.procZombie.value = result_zombie;
    });

    // console.log(metrics);
}

function initMetrics() {
    metrics.procRunning = {
        name  : 'Total Processes',
        value : 'N/A'
    }

    metrics.procZombie = {
        name  : 'Zombie processes',
        value : 'N/A',
        alert : {
            mode : 'threshold-avg',
            value : 10,
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
