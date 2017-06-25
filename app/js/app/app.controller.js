sshfdApp.controller('AppController', function AppController($scope, $timeout, DataBase) {
    var ac = this;
    ac.loaded = false;
    ac.selected_device = null;
    ac.settings_selected = false;

    function init() {
        // Initialize the application
        var db = DataBase;
        var awaiting = 1;
        db.init(callback);

        function callback() {
            awaiting--;
            if (awaiting < 1) {
                ac.loaded = true;
            }
        }
    }
    init();

    ac.select_device = function(device) {
        $timeout(function() {
            ac.selected_device = null;
            $timeout(function () {
                ac.settings_selected = false;
                ac.selected_device = device;
            });
        });
    }

    ac.exit = function() {
        window.close();
    }

    ac.settings = function() {
        $timeout(function() {
            ac.selected_device = null;
            ac.settings_selected = true;
        });
    }
});