sshfdApp.directive('onTab', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 9) {
                scope.$apply(function (){
                    scope.$eval(attrs.onTab);
                });

                event.preventDefault();
            }
        });
    };
});

sshfdApp.controller('DeviceController',
        function DeviceController($scope, $timeout, DataBase, SSH, Definitions) {
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
                dc.device.tab = false;
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

        // Build function set
        dc.function_set_obj = {};
        dc.function_set = [];
        if (dc.device.definitions !== undefined) {
            dc.device.definitions.forEach(function(element) {
                var definition = Definitions.getDefinition(element);
                for (var fs in definition.functions) {
                    if (definition.functions.hasOwnProperty(fs)) {
                        if (fs in dc.function_set_obj) {
                            dc.function_set_obj[fs] =
                                dc.function_set_obj[fs].concat(definition.functions[fs])
                        } else {
                            dc.function_set_obj[fs] = [].concat(definition.functions[fs])
                        }
                    }
                }
            }, this);

            // Parse function set object to function set list
            for (var fs_name in dc.function_set_obj) {
                if (dc.function_set_obj.hasOwnProperty(fs_name)) {
                    dc.function_set.push({
                        "name": fs_name,
                        "functions": dc.function_set_obj[fs_name]
                    });
                }
            }
        }
    }

    dc.disconnect = function() {
        dc.device.connection.close();
    }

    dc.sendRaw = function(command) {
        dc.device.connection.sendCommand(command + '\n');
        dc.device.input = '';
    }

    dc.sendTab = function(command) {
        dc.device.tab = true;
        dc.device.connection.sendCommand(command + '\t');
    }

    dc.onMsg = function(data) {
        $timeout(function() {
            if (dc.device.tab) {
                dc.device.input = data;
                dc.device.tab = false;
            } else {
                dc.device.raw_output += data;
            }
            $timeout(function() {
                d = $('#raw_output')
                d.scrollTop(d.prop("scrollHeight") - d.prop("clientHeight"));
            });
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