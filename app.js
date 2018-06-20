// var pmx     = require('pmx');
var fs      = require('fs');
var path    = require('path');
var cpu     = require('./lib/cpu.js');
var drive   = require('./lib/drive.js');
var mem     = require('./lib/mem.js');
var os      = require('./lib/os.js');
var users   = require('./lib/users.js');
var netstat = require('./lib/netstat.js');
var proc    = require('./lib/proc');
var actions = require('./lib/actions.js');
var lsof    = require('./lib/openfiles.js');

// console.log(proc.init());
var config = {
    widget : {
        type             : 'generic',
        logo             : 'https://www.glcomp.com/media/catalog/category/Dell-R620_3_1_1.png',

        // 0 = main element
        // 1 = secondary
        // 2 = main border
        // 3 = secondary border
        theme            : ['#111111', '#1B2228', '#807C7C', '#807C7C'],

        el : {
            probes  : true,
            actions : true
        },

        block : {
            actions : false,
            issues  : true,
            meta : true,
            cpu: false,
            mem: false,
            main_probes : ['CPU usage', 'Free memory', 'Avail. Disk', 'Total Processes', 'TTY/SSH opened', 'network in', 'network out', 'Operating System']
        }

        // Status
        // Green / Yellow / Red
    }, 
    small_interval: 2
}
// pmx.initModule(
// }, function(err, conf) {

    // console.log('-- Start Config');
    // console.log(config);
    // console.log('//-- End Config');


  cpu.init(config);
  os.init();
  drive.init(config);
  users.init(config);
  lsof.init(config);
  mem.init(config);
  netstat.init(config);
  proc.init(config);

  actions.initActions();
// });
