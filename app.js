var async   = require('async');
var cpu     = require('./lib/cpu.js');
var drive   = require('./lib/drive.js');
var mem     = require('./lib/mem.js');
var os      = require('./lib/os.js');
var users   = require('./lib/users.js');
var netstat = require('./lib/netstat.js');
var processes    = require('./lib/processes');
var actions = require('./lib/actions.js');
var lsof    = require('./lib/openfiles.js');
var pmapps    = require('./lib/pmapps.js');
var server    = require('./lib/server.js');
var eslogger    = require('./lib/eslogger.js');

var conf = {
    drive: '/',
    interval: 5,
    elasticsearch_url: "localhost:9200",
    elasticsearch_index: "server_monitoring",
    elasticsearch_user: "",
    elasticsearch_password: ""
}

var tasks = [
    'server',
    'pmapps',
    'cpu',
    'os', 
    'drive', 
    'users', 
    'openfiles', 
    'memory', 
    'netstat', 
    'processes',
    'rawstat'
]

function refreshMetrics() {
    conf.interval = (process.env.interval!==undefined) ? process.env.interval : conf.interval;
    conf.drive = (process.env.drive!==undefined) ? process.env.drive : conf.drive;

    async.map(tasks, function(task, callback) {
        switch(task) {
            case 'pmapps':
                pmapps.init(task, callback);
                break;

            case 'cpu':
                cpu.init(task, callback);
                break;
            
            case 'os':
                os.init(task, callback);
                break;

            case 'drive':
                drive.init(conf.drive, task, callback);
                break;

            case 'users':
                users.init(task, callback);
                break;

            case 'openfiles':
                lsof.init(task, callback);
                break;

            case 'memory':
                mem.init(task, callback);
                break;

            case 'netstat':
                netstat.init(conf.interval, task, callback);
                break;

            case 'processes':
                processes.init(task, callback);
                break;

            case 'rawstat':
                actions.init(task, callback);
                break;

            case 'server':
                server.init(task, callback);
                break;
        }
    }, function(error, results) {
        objResults = {};
        if(error===null) {
            results.forEach(result => {
                objResults = Object.assign(objResults, result.result);                
            });
            
            eslogger.log(conf, objResults);
                
            setTimeout(function() {
                refreshMetrics();
            }, conf.interval * 1000);
        }
    });
}

refreshMetrics();