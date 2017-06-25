sshfdApp
    .filter('replaceNL', function() {
        return function(input) {
            return input.replace('\n', '<br />');
        };
    })
    .filter('connectedCount', function() {
        return function(input) {
            var online = 0;
            input.forEach(function(element) {
                if (element.connected) {
                    online++;
                }
            }, this);
            return online + '/' + input.length;
        }
    })