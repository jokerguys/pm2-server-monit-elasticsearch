var os = require('os');
var cp = require('child_process');
var exec = require('./exec.js');

// var Probe = pmx.probe();
var metrics = {};

function refreshMetrics(callback) {

  exec('cat /proc/meminfo | head -5', function(err, out) {
    var total_mem;
    var free_mem;
    if (err || !out) {
      total_mem = os.totalmem() / 1024;
      free_mem = os.freemem() / 1024;
      if (os.platform() == 'darwin') {
        var mem = darwinMem.memory();
        total_mem = mem.total;
        free_mem = mem.total - mem.used;
      }
    } else {
      var result_memory = (out.match(/\d+/g));
      total_mem = result_memory[0];
      free_mem = parseInt(result_memory[1]) + (parseInt(result_memory[3]) + parseInt(result_memory[4]));
    }

    var total_mem_gb = (total_mem/1024/1024).toFixed(1) + 'GB';
    var used_mem = ((total_mem - free_mem)/1024/1024).toFixed(1) + 'GB';
    var result_memory_used = used_mem + ' / ' + total_mem_gb;
    var free_mem_pour = (100 * (free_mem / total_mem)).toFixed(1) + '%';

    metrics.result.memory.free.value = free_mem_pour;
    metrics.result.memory.used.value = result_memory_used;
  });

  setTimeout(function() {
    callback(null, metrics);
  }, 1000);
}

var darwinMem = {
  PAGE_SIZE: 4096,
  physicalMemory: function() {
    var res = cp.execSync('sysctl hw.memsize').toString()
    res = res.trim().split(' ')[1]
    return parseInt(res)
  },
  vmStats: function() {

    var mappings = {
      'Anonymous pages'              : 'app',
      'Pages wired down'             : 'wired',
      'Pages active'                 : 'active',
      'Pages inactive'               : 'inactive',
      'Pages occupied by compressor' : 'compressed'
    }

    var ret = {}
    var res = cp.execSync('vm_stat').toString()
    var lines = res.split('\n')
    lines = lines.filter(function (x) {
      return x !== ''
    });

    lines.forEach(function (x) {
      var parts = x.split(':')
      var key = parts[0]
      var val = parts[1].replace('.', '').trim()
      if (mappings[key]) {
        var k = mappings[key]
        ret[k] = val * darwinMem.PAGE_SIZE
      }
    })
    return ret
  },
  memory: function() {
    var total = darwinMem.physicalMemory()
    var stats = darwinMem.vmStats()
    // This appears to be contested
    // not clear what apple is using for "Memory Used" in app
    var used = (stats.wired + stats.active + stats.inactive)
    return { used: used/1024, total: total/1024 }
  }
}

function initMetrics(task) {
  metrics.tag = task;
  metrics.result = {};
  metrics.result.memory = {};
  metrics.result.memory.free = {
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 10,
      cmp : '<'
    }
  };

  metrics.result.memory.used = {
    value : 'N/A'
  };
}

function init(task, callback) {
  initMetrics(task);
  refreshMetrics(callback);
}

module.exports.init = init;
