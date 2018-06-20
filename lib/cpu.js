var pmx       = require('pmx');
var os = require("os");

var probe = pmx.probe();
var metrics = {};
// var metric = {
//     name: 'CPU usage',
//     cpuNumber: 0,
//     value: 'N/A'
// }

function refreshMetrics(interval) {
    function cpuAverage() {
        
        var totalIdle = 0, totalTick = 0;
        var cpus = os.cpus();

        // console.log(cpus.length);

        for(var i = 0, len = cpus.length; i < len; i++) {
            var cpu = cpus[i];
            for(type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        }

        return {
            idle: totalIdle / cpus.length,  
            total: totalTick / cpus.length
        };
    }

    var startMeasure = cpuAverage();

    setTimeout(function() {
        var endMeasure = cpuAverage();

        var idleDifference = endMeasure.idle - startMeasure.idle;
        var totalDifference = endMeasure.total - startMeasure.total;

        var percentageCPU = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100;
        metrics.cpuResult.value = percentageCPU + '%';
        // metrics.push(metric);
        // console.log(metrics);
        // console.log(process.env.pm_id + ': ' + process.env.name); 
        setTimeout(function() { 
            refreshMetrics(interval); 
        }, interval * 1000);

    }, 100);
}

function initMetrics() {
    metrics.cpuResult = {
        name: 'CPU usage',
        value: 'N/A'
    }
}

function init(conf) {
    initMetrics();
    // console.log(conf.small_interval);
    refreshMetrics(conf.small_interval);
}

module.exports.init = init;
