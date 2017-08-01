(function() {
    'use strict';

    sshfdApp.controller('ActiveDevicesController', ActiveDevicesController);
    ActiveDevicesController.$inject = ['$scope', '$timeout', 'DataBase',
        'Definitions', 'ngDialog'];

    function ActiveDevicesController($scope, $timeout, DataBase, Definitions, ngDialog) {
        var ad = this;
        var db = DataBase;
        ad.defs = Definitions;
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
                username: "",
                definitions: []
            }
            ad.defs.listDefinitions('', ad.new_device.definitions);
            ad.defs.definition_search = '';
            var dialog = ngDialog.open({
                template: 'templates/addDevice.html',
                className: 'ngdialog-theme-default',
                scope: $scope
            });
        }

        ad.addDefinition = function(definition_name) {
            ad.new_device.definitions.push(definition_name);
            ad.defs.listDefinitions(ad.defs.definition_search, ad.new_device.definitions);
        }

        ad.removeDefinition = function(definition_name) {
            ad.new_device.definitions.splice(
                ad.new_device.definitions.indexOf(definition_name), 1
            );
            ad.defs.listDefinitions(ad.defs.definition_search, ad.new_device.definitions);
        }

        ad.addDefinitionEdit = function(definition_name) {
            ad.edit_device.definitions.push(definition_name);
            ad.defs.listDefinitions(ad.defs.definition_search, ad.edit_device.definitions);
        }

        ad.removeDefinitionEdit = function(definition_name) {
            ad.edit_device.definitions.splice(
                ad.edit_device.definitions.indexOf(definition_name), 1
            );
            ad.defs.listDefinitions(ad.defs.definition_search, ad.edit_device.definitions);
        }

        ad.addDevice = function(device) {
            var device = {
                name: device.name,
                id: device.id,
                ip: device.ip,
                username: device.username,
                definitions: device.definitions
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

        ad.storeDevice = function(device) {
            var device = {
                name: device.name,
                _id: device._id,
                ip: device.ip,
                username: device.username,
                definitions: device.definitions
            };

            db.update('devices', {_id: device._id}, device, function(err, newDev) {
                if (err == null) {
                    console.log('Succesfully updated device');
                    loadDevices();
                } else {
                    console.log('Failed to add device: ' + err);
                }
            });
        }

        ad.showDeviceSettings = function(device) {
            ad.edit_device = jQuery.extend(true, {}, device);
            if(ad.edit_device.definitions === undefined)  {
                ad.edit_device.definitions = [];
            }

            ad.defs.listDefinitions('', ad.edit_device.definitions);
            ad.defs.definition_search = '';

            var dialog = ngDialog.open({
                template: 'templates/editDevice.html',
                className: 'ngdialog-theme-default',
                scope: $scope
            });
        }

        ad.removeDevice = function(device) {
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