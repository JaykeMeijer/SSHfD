sshfdApp.controller('SingleCommandController',
        function SingleCommandController() {
    var sc = this;

    sc.send = function(dc, func) {
        console.log(dc);
        if (func.root) {
            dc.sendSudo(func.command);
        } else {
            dc.sendRaw(func.command);
        }
    }
});