var pm2 = require('pm2');
var metrics = {};

function refreshAppDetails(callback) {
    var pmProcesses = [];

    (function(callback) {
        pm2.list(function(errback, processDescriptionList) {
            
            processDescriptionList.forEach((pmProcess, pmProcessIndex) => {

                var pmProcessDetails = {
                    name: pmProcess.pm2_env.name,
                    pid: pmProcess.pm2_env.pid,
                    pm_id: pmProcess.pm2_env.pm_id,
                    user: pmProcess.pm2_env.user,
                    autorestart: pmProcess.pm2_env.autorestart,
                    max_memory_restart: pmProcess.pm2_env.max_memory_restart,
                    instances: pmProcess.pm2_env.instances,
                    node_app_instance: pmProcess.pm2_env.NODE_APP_INSTANCE,
                    status: pmProcess.pm2_env.status,
                    pm_uptime: pmProcess.pm2_env.pm_uptime,
                    restart_time: pmProcess.pm2_env.restart_time,
                    unstable_restarts: pmProcess.pm2_env.unstable_restarts,
                    version: pmProcess.pm2_env.version,
                    node_version: pmProcess.pm2_env.node_version,
                    exit_code: pmProcess.pm2_env.exit_code,
                    pm2_version: pmProcess.pm2_env._pm2_version,
                    os: {
                        name: pmProcess.pm2_env.env._system_name,
                        version: pmProcess.pm2_env.env._system_version,
                        arch_type: pmProcess.pm2_env.env._system_arch
                    },
                    utilization: {
                        memory: pmProcess.monit.memory,
                        cpu: pmProcess.monit.cpu
                    }
                }

                pmProcesses.push(pmProcessDetails);
            });

            metrics.result.pm_applications = pmProcesses;
            callback(null, metrics);
        });
    })(callback);
}

function init(task, callback) {
    metrics.tag = task;
    metrics.result = {};
    metrics.result.pm_applications = [];

    refreshAppDetails(callback);
}

module.exports.init = init;