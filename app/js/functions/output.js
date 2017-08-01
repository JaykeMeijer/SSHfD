sshfdApp.controller('OutputController', OutputController);
OutputController.$inject = ['$scope','ngDialog'];

function OutputController($scope, ngDialog) {
    var sc = this;

    sc.send = function(dc, func) {
        if (func.root) {
            dc.sendSudo(func.command, sc.showResult);
        } else {
            dc.sendRaw(func.command, sc.showResult);
        }
    }

    sc.showResult = function(data) {
        $scope.data = data;
        var dialog = ngDialog.open({
            template: 'templates/functions/output_showres.html',
            className: 'ngdialog-theme-default dialog_wide',
            scope: $scope
        });
    }
}