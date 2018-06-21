var os = require('os');
var metrics = {};

function refreshHostDetails(task, callback) {
    metrics.tag = task;
    metrics.result = {}
    metrics.result.server = {
      name: 'Server Details',
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus(),
      networkInterfaces: os.networkInterfaces()
    };

    callback(null, metrics);
}

  
  function init(task, callback) {
    refreshHostDetails(task, callback);
  }
  
  module.exports.init = init;