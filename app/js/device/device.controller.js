sshfdApp.controller('DeviceController',
        function DeviceController($scope, $timeout, DataBase, SSH) {
    var dc = this;
    dc.connecting = false;

    dc.select = function(device) {
        $timeout(function() {
            dc.device = device;
            if (dc.device.active_set === undefined) {
                dc.device.active_tab = 'info';
            }
            if (dc.device.active_set === undefined) {
                dc.device.active_set = null;
            }
            dc.tempusername = dc.device.username;
            dc.connect_failed = false;
            dc.function_set = [
                {'name': 'System', 'functions': []},
                {'name': 'Sensors', 'functions': []}
            ];
        })
    }

    dc.showInfo = function(elem) {
        dc.device.active_tab = 'info';
        dc.device.active_set = null;
        $('#device_nav li').removeClass('active');
        $(elem).addClass = 'active';
    }

    dc.showRaw = function(elem) {
        dc.device.active_tab = 'raw';
        dc.device.active_set = null;
        $('#device_nav li').removeClass('active');
        $(elem).addClass = 'active';
    }

    dc.showSet = function(set, elem) {
        dc.device.active_tab = 'function_set';
        dc.device.active_set = set;
        $('#device_nav li').removeClass('active');
        $(elem).addClass = 'active';
    }

    dc.connect = function(username, password) {
        dc.connecting = true;
        SSH.setup(dc.device.ip, username, password, function(errorcode, ssh) {
            if (ssh != null) {
                dc.connect_failed = false;
                dc.device.connection = ssh;
                dc.device.connection.onMsg = dc.onMsg;
                dc.device.connection.onClose = dc.onClose;
                dc.device.disconnect = dc.disconnect;
                $timeout(function() {
                    dc.device.connected = true;
                    dc.connecting = false;
                });
            } else {
                $timeout(function() {
                    dc.connect_failed = true;
                    dc.connecting = false;
                    dc.error_message = '';
                    switch(errorcode) {
                        case 1:
                            dc.error_message = 'Could not open shell on remote host. Possible implementation error';
                            break;
                        case 2:
                            dc.error_message = 'Authentication failed. Please verify your credentials and try again';
                            break;
                        case 3:
                            dc.error_message = 'Selected device not reachable';
                            break;
                        case 4:
                            dc.error_message = 'Unexpected error occured during connection';
                            break;
                    }
                })
            }
        });
    }

    dc.disconnect = function() {
        dc.device.connection.close();
    }

    dc.sendRaw = function(command) {
        dc.device.connection.sendCommand(command + '\n');
        dc.device.input = '';
    }

    dc.onMsg = function(data) {
        $timeout(function() {
            dc.device.raw_output += data;
            $timeout(function() {
                d = $('#raw_output')
                d.scrollTop(d.prop("scrollHeight") - d.prop("clientHeight"));
            })
        });
    }

    dc.onClose = function() {
        dc.device.connected = false;
        dc.device.connection = null;
        dc.device.active_set = undefined;
        dc.device.active_tab = undefined;
        dc.device.input = undefined;
    }
});