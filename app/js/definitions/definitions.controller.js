(function ($, _) {
    'use-strict';

    sshfdApp
        .factory('Definitions', Definitions);

        function Definitions() {
            var defc = this;
            defc.definitions = [];
            defc.definition_search = '';
            defc.foundDefinitions = [];
            var dirname = 'definitions'

            var funcs = {
                init: init,
                listDefinitions: listDefinitions,
                getFoundDefinitions: getFoundDefinitions,
                getDefinition: getDefinition
            }
            return funcs;

            function init(callback) {
                var fs = require('fs');

                fs.readdir(dirname, function(err, filenames) {
                    if (err) {
                        onError(err);
                        if (callback !== undefined){callback()};
                        return;
                    }
                    var awaiting = filenames.length;
                    filenames.forEach(function(filename) {
                        if (filename.endsWith('.json')) {
                            fs.readFile(dirname + '/' + filename, 'utf-8', function(err, content) {
                                if (err) {
                                    onError(err);
                                    cb();
                                    return;
                                }
                                onFileContent(filename, content);
                                cb();
                            });
                        }
                    });
                    function cb() {
                        awaiting--;
                        if (awaiting < 1) {
                            defc.foundDefinitions = [].concat(defc.definitions);
                            if (callback !== undefined){callback()};
                        }
                    }
                });

                function onError(err) {
                    console.error(err);
                }

                function onFileContent(filename, content) {
                    try {
                        var contents = JSON.parse(content);
                    } catch (err) {
                        console.error('Invalid JSON for ' + filename);
                        return;
                    }
                    defc.definitions.push(contents);
                }
            }

            function listDefinitions(term, already_selected) {
                if (term == undefined) {
                    term = '';
                }
                var term_l = term.toLowerCase();
                defc.foundDefinitions = defc.definitions.filter(function(item) {
                    return item.name.toLowerCase().indexOf(term_l) > -1 ||
                        item.description.toLowerCase().indexOf(term_l) > -1;
                });
                defc.foundDefinitions = defc.foundDefinitions.filter(function(item) {
                    return already_selected.indexOf(item.name) < 0;
                });
            }

            function getFoundDefinitions() {
                return defc.foundDefinitions;
            }

            function getDefinition(name) {
                return defc.definitions.find(function(item) {
                    return item.name == name;
                });
            }
        }
})();