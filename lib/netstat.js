var os = require('os');
var exec = require('./exec.js');

var metrics = {};
var oldStats = [];

function refreshIp(interval, callback) {
    exec('ip -s link', function(err, out) {
        if (err) {
            refreshIfconfig(interval, callback)
            return;
        }
        var names = new RegExp(/[0-9]+: ([\S]+): /g);
        var RX = new RegExp(/    RX: bytes  packets  errors  dropped overrun mcast\s*\n\s*([0-9]+) /gm);
        var TX = new RegExp(/    TX: bytes  packets  errors  dropped carrier collsns \s*\n\s*([0-9]+) /g);

        var stats = [];
        var i = 0, totalIn = 0, totalOut = 0;

        while ((res = names.exec(out)) !== null) {
        stats[i++] = {
            interface: res[1]
        };
        }

        var i = 0;
        while((res= RX.exec(out)) !== null) {
        stats[i++].inputBytes = res[1];
        }
        var i = 0;
        while((res= TX.exec(out)) !== null) {
        stats[i++].outputBytes = res[1];
        }

        for (var i = 0; i < stats.length; i++) {
        if (!metrics[stats[i].interface] && stats[i].interface != 'lo' && stats[i].outputBytes > 0) {
            metrics[stats[i].interface] = {};

            metrics[stats[i].interface].input = {
            name  : stats[i].interface + ' input',
            value : function() { return 0; }
            };

            metrics[stats[i].interface].output = {
            name  : stats[i].interface + ' output',
            value : function() { return 0; }
            };
        }

        if (metrics[stats[i].interface]) {
                if (oldStats && oldStats[i]) {
            var output = ((stats[i].outputBytes - oldStats[i].outputBytes) / interval) /  1000000;
            var input = ((stats[i].inputBytes - oldStats[i].inputBytes) / interval) / 1000000;
            } else {
            var output = 0
            var input = 0;
            }

            metrics[stats[i].interface].output.value = output.toFixed(2) + 'MB/s';
            metrics[stats[i].interface].input.value = input.toFixed(2) + 'MB/s';

            totalIn += input;
            totalOut += output;
        }
        }
        if (stats.length > 0) {
        metrics.result.netstat.netstat.value = totalIn.toFixed(2) + 'MB/s';
        metrics.result.netstat.output.value = totalOut.toFixed(2) + 'MB/s';
        totalIn = 0;
        totalOut = 0;
        }
        oldStats = stats;

        callback(null, metrics);
    });
}

function refreshIfconfig(interval, callback) {

  exec('/sbin/ifconfig', function(err, out) {
    if (err) {
      metrics.result.netstat.input.value = '0';
      metrics.result.netstat.output.value = '0';
      return;
    }
    var totalRx = 0;
    var totalTx = 0;
    var blocks = ifconfig.breakIntoBlocks(out)
    var nbProblems = 0;
    var newStats = []
    if (!oldStats) {
      oldStats = blocks;
    }
    blocks.forEach(function (block) {
      block = ifconfig.parseSingleBlock(block)
      oldStats.push(block)
      if (block.device != 'lo' && block.device != 'lo0' && block.other && block.other.rxBytes > 0 && block.other.txBytes > 0) {
        createProbe(block.device)
        var old = getOldStats(block.device)
        if (old) {
          metrics.result.netstat.device[block.device].input.value = (((block.other.rxBytes - old.other.rxBytes) / interval) / 1000000).toFixed(2) + ' MB/s';
          metrics.result.netstat.device[block.device].output.value = (((block.other.txBytes - old.other.txBytes) / interval) / 1000000).toFixed(2) + ' MB/s';
          totalRx += block.other.rxBytes - old.other.rxBytes
          totalTx += block.other.txBytes - old.other.txBytes
        }
        newStats.push(block)
      } else {
        nbProblems++;
      }
    })
    oldStats = newStats

    //set total
    if (nbProblems == blocks.length) {
      metrics.result.netstat.input.value = '0';
      metrics.result.netstat.output.value = '0';
      return;
    }
    metrics.result.netstat.input.value = ((totalRx / 1000000) / interval).toFixed(2) + ' MB/s';
    metrics.result.netstat.output.value = ((totalTx / 1000000) / interval).toFixed(2) + ' MB/s';

    
  })

    setTimeout(function() {
        callback(null, metrics);
    }, 1000)
}

function createProbe(dev) {
  if (metrics.result.netstat.device[dev] == null) {
    metrics.result.netstat.device[dev] = {};

    metrics.result.netstat.device[dev]['input'] = {
      value : function() { return 0; }
    };

    metrics.result.netstat.device[dev]['output'] = {
      value : function() { return 0; }
    };
  }
}

function getOldStats(dev) {
  for (var i = 0; i < oldStats.length; i++) {
    if (oldStats[i].device == dev) {
      return oldStats[i]
    }
  }
}


var ifconfig = {
  breakIntoBlocks: function breakIntoBlocks(fullText) {
    var blocks = [];
    var lines = fullText.split('\n');
    var currentBlock = [];
    lines.forEach(function(line) {
        if (line.length > 0 && ['\t', ' '].indexOf(line[0]) === -1 && currentBlock.length > 0) { // start of a new block detected
            blocks.push(currentBlock);
            currentBlock = [];
        }
        if (line.trim()) {
            currentBlock.push(line);
        }
    });
    if (currentBlock.length > 0) {
       blocks.push(currentBlock);
    }
    return blocks;
  },

  parseSingleBlock: function parseSingleBlock(block) {
      var data = {};
      block.forEach(function(line, i) {
          var match = line.match(/^(\S+)\s+Link/)
          if (i == 0) {
            var match2 = line.match(/([a-zA-Z0-9]+):\s/)
            if (match == null && match2) {
              match = match2;
            }
          }
          if (match) { // eth0      Link encap:Ethernet  HWaddr 04:01:d3:db:fd:01
              data.device = match[1]; // eth0
              var link = {};
              match = line.match(/encap:(\S+)/);
              if (match) {
                  link.encap = match[1];
              }
              match = line.match(/HWaddr\s+(\S+)/);
              if (match) {
                  link.hwaddr = match[1];
              }
              data.link = link;
          } else {
              var section = data.other || {};
              if (match = line.match(/collisions:(\S+)/)) {
                section.collisions = parseInt(match[1]);
              }
              if (match = line.match(/txqueuelen:(\S+)/)) {
                section.txqueuelen = parseInt(match[1]);
              }
              if (match = line.match(/RX bytes:(\S+)/)) {
                section.rxBytes = parseInt(match[1]);
              }
              if (match = line.match(/RX packets (\S+)  bytes (\S+)/)) {
                section.rxBytes = parseInt(match[2])
              }
              if (match = line.match(/TX bytes:(\S+)/)) {
                section.txBytes = parseInt(match[1]);
              }
              if (match = line.match(/TX packets (\S+)  bytes (\S+)/)) {
                section.txBytes = parseInt(match[2])
              }
              data.other = section;
          }
      });
      return data;
  }
}

function initMetrics(task) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.netstat = {
        device: [],
        input: {
            value : 'N/A'
        },
        output: {
            value : 'N/A'
        }
    }
}

function init(interval, task, callback) {
  initMetrics(task);
  refreshIp(interval, callback);
}

module.exports.init = init;
