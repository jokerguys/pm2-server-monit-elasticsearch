var os = require("os");

var metrics = {};

function refreshMetrics(callback) {
    function cpuAverage() {
        
        var totalIdle = 0, totalTick = 0;
        var cpus = os.cpus();

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
        metrics.result.cpu_usage.value = percentageCPU + '%';

        callback(null, metrics);    
    }, 100);
}

function initMetrics(task) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.cpu_usage = {};
    metrics.result.cpu_usage.value = 'N/A';
}

function init(task, callback) {
    initMetrics(task);
    refreshMetrics(callback);
}

module.exports.init = init;
