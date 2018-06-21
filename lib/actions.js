var exec = require('./exec.js');

var metrics = {};

function refreshActions(callback) {
    if (process.platform == 'linux') {
        var top_cpu_process = exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
            metrics.result.rawstat.top_cpu_process = out.split("\n");
        });


        var top_mem_process = exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
            metrics.result.rawstat.top_mem_process = out.split("\n");
        });


        var vmstats = exec('vmstat -S m', function(err, out) {
            metrics.result.rawstat.vmstats = out.split("\n");
        });
    }

    var proc_users = exec('ps hax -o user | sort | uniq -c', function(err, out) {
        metrics.result.rawstat.processes = out.split("\n");
    });

    var disk_usage = exec('df -h', function(err, out) {
        metrics.result.rawstat.disk_usage = out.split("\n");
    });

    var who = exec('who', function(err, out) {
        metrics.result.rawstat.who = out.split("\n");
    });

    var uptime = exec('uptime', function(err, out) {
        metrics.result.rawstat.uptime = out.split("\n");
    });

    var open_ports = exec('lsof -Pni4 | grep ESTABLISHED', function(err, out) {
        metrics.result.rawstat.open_ports = out.split("\n");
    });

    var open_ports = exec('ifconfig', function(err, out) {
        metrics.result.rawstat.ifconfig = out.split("\n");
    });

    setTimeout(function() {
        callback(null, metrics);
    }, 1000);
}

function init(task, callback) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.rawstat = {};

    refreshActions(callback);
}

module.exports.init = init;
