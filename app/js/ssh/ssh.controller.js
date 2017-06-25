(function ($, _) {
    'use-strict';

    sshfdApp
        .factory('SSH', SSH);

    function SSH() {
        var node_ssh = require('node-ssh');

        var funcs = {
            setup: setup
        };
        return funcs;

        function setup(host, username, password, callback) {
            ssh = new node_ssh();
            ssh.connect({
                host: host,
                username: username,
                password: password
            }).then(function() {
                console.log('connection succeeded');
                ssh.requestShell().then(function(shell) {
                    console.log('Shell created: ' + shell);
                    conn_obj = new ssh_container(ssh, shell);
                    if (callback !== undefined) {callback(null, conn_obj)};
                }, function(err) {
                    console.log('Failed to open shell');
                    if (callback !== undefined) {callback(1, null)};
                });
            }, function(err) {
                console.log('connection failed: ' + err.message);
                if (err.message.indexOf('authentication') > -1) {
                    var error = 2;
                } else if (err.message.indexOf('Timed out') > -1) {
                    var error = 3;
                } else {
                    var error = 4;
                }
                if (callback !== undefined) {callback(error, null)};
            });
        }

        function ssh_container(ssh_obj, stream) {
            var ssh = this;
            ssh.connection = ssh_obj;
            ssh.stream = stream;
            ssh.onMsg = null;
            ssh.onErr = null;
            ssh.onClose = null;

            ssh.stream.on('close', function() {
                if (ssh.onClose != null) {
                    ssh.onClose();
                }
                ssh.stream.end();
            }).on('data', function(data) {
                if (ssh.onMsg != null) {
                    ssh.onMsg(data);
                }
            }).stderr.on('data', function(data) {
                if (ssh.onErr != null) {
                    ssh.onErr(data);
                }
            });

            ssh.close = function() {
                ssh.stream.write('logout\n');
                ssh.stream.end();
            }

            ssh.sendCommand = function(command) {
                ssh.stream.write(command);
            }
            return ssh;
        }
    }
})();