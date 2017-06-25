// Define the `phonecatApp` module
var sshfdApp = angular.module('sshfdApp', ['ngDialog']);

sshfdApp
    .directive('autofocus', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link : function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    }]);