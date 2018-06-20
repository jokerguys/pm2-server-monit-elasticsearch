var pmx = require('pmx');
var exec = require('./exec.js');

var results = {};

function initActions() {
    if (process.platform == 'linux') {
        var top_cpu_process = exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
            results.top_cpu_process = out.split("\n"); //.replace(/\n/g, "<br />");
        });


        var top_mem_process = exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
            results.top_mem_process = out.split("\n"); //.replace(/\n/g, "<br />");
        });


        var vmstats = exec('vmstat -S m', function(err, out) {
            results.vmstats = out.split("\n"); //.replace(/\n/g, "<br />");
        });
    }


    var proc_users = exec('ps hax -o user | sort | uniq -c', function(err, out) {
        results.processes = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    var disk_usage = exec('df -h', function(err, out) {
        results.disk_usage = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    var who = exec('who', function(err, out) {
        results.who = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    var uptime = exec('uptime', function(err, out) {
        results.uptime = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    var open_ports = exec('lsof -Pni4 | grep ESTABLISHED', function(err, out) {
        results.open_ports = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    var open_ports = exec('ifconfig', function(err, out) {
        results.ifconfig = out.split("\n"); //.replace(/\n/g, "<br />");
    });

    setTimeout(function() {
        // console.log(results);
    }, 1000);
}

module.exports.initActions = initActions;
