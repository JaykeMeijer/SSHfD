(function() {
    'use strict';

    sshfdApp.controller('ActiveDevicesController', ActiveDevicesController);
    ActiveDevicesController.$inject = ['$scope', '$timeout', 'DataBase',
        'ngDialog'];

    function ActiveDevicesController($scope, $timeout, DataBase, ngDialog) {
        var ad = this;
        var db = DataBase;
        ad.devices = [];
        ad.devices_loaded = false;

        function loadDevices() {
            db.all('devices', function(err, devices) {
                if (err == null) {
                    ad.devices = [];
                    devices.forEach(function(element) {
                        element.connected = false;
                        element.raw_output = '';
                        element.showDropdown = false;
                        ad.devices.push(element);
                    }, this);

                    $timeout(function() {
                        $scope.$apply();
                        ad.devices_loaded = true;
                    });
                } else {
                    console.log('Failed to get devices: ' + err);
                }
            });
        }
        loadDevices();

        ad.showAddDevice = function() {
            ad.new_device = {
                name: "",
                ip: "",
                username: ""
            }
            var dialog = ngDialog.open({
                template: 'templates/addDevice.html',
                className: 'ngdialog-theme-default',
                scope: $scope
            });
        }

        ad.addDevice = function(device) {
            var device = {
                name: device.name,
                id: device.id,
                ip: device.ip,
                username: device.username
            };

            db.insert('devices', device, function(err, newDev) {
                if (err == null) {
                    console.log('Succesfully added device');
                    loadDevices();
                } else {
                    console.log('Failed to add device: ' + err);
                }
            });
        }

        ad.removeDevice = function(device) {
            console.log("removing")
            console.log(device);
            db.remove('devices', {_id: device._id}, {}, function(err, numRemove) {
                if (err == null) {
                    console.log('Removed device');
                    loadDevices();
                } else {
                    console.log('Failed to remove device: ' + err);
                }
            });
        }

        ad.toggleDeviceOptions = function(device, $event) {
            if (!device.showDropdown) {
                ad.closeAllDropdowns();
                device.showDropdown = true;

            } else {
                device.showDropdown = false;
            }
            $event.stopPropagation();
        }

        ad.closeAllDropdowns = function(device) {
            ad.devices.map(function(item) {
                item.showDropdown = false;
            });
        }

        ad.executeDropdown = function($event, device, command) {
            switch(command) {
                case 'settings':
                    ad.showDeviceSettings(device);
                    break;
                case 'remove':
                    ad.removeDevice(device);
                    break;
                case 'disconnect':
                    device.disconnect();
                    break;
                default:
                    console.error('Unsupported dropdown command');
            }
            device.showDropdown = false;
            $event.stopPropagation();
        }
    }
})();