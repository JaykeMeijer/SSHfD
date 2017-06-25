(function ($, _) {
    'use-strict';

    sshfdApp
        .factory('DataBase', DataBase);

    function DataBase() {
        var Datastore = require('nedb');
        var db = {};
        var loaded = false;

        var funcs = {
            init: init,
            insert: insert,
            remove: remove,
            getById: getById,
            all: all,
            find: find
        };
        return funcs;

        function init(callback) {
            if (!loaded) {
                var awaiting = 1;

                load('devices', callback2);
                
                function callback2() {
                    awaiting--;
                    if (awaiting < 1) {
                        loaded = true;
                        if (callback !== undefined){callback()};
                    }
                }
            }
        }

        function load(type, callback) {
            db[type] = new Datastore('app/js/database/datastore/' + type + '.db');

            db[type].loadDatabase(function(err) {
                if (err != null) {
                    console.log('Failed to load database ' + type)
                }
                if (callback !== undefined){callback()};
            });
        }

        function insert(type, record, callback) {
            if (db[type] !== undefined) {
                db[type].insert(record, function(err, newDoc) {
                    if (callback !== undefined){callback(err, newDoc)};
                });
            } else {
                console.error('Unknown database');
                if (callback !== undefined){callback('Unknown database', null)};
            }
        }

        function remove(type, query, options, callback) {
            if (db[type] !== undefined) {
                db[type].remove(query, options, function(err, newDoc) {
                    if (callback !== undefined){callback(err, newDoc)};
                });
            } else {
                console.error('Unknown database');
                if (callback !== undefined){callback('Unknown database', null)};
            }
        }

        function getById(type, id, callback) {

        }

        function all(type, callback) {
            find(type, {}, callback);
        }

        function find(type, parameters, callback) {
            if (db[type] !== undefined) {
                db[type].find(parameters, function(err, docs) {
                    if (callback !== undefined){callback(err, docs)};
                });
            } else {
                console.error('Unknown database');
                if (callback !== undefined){callback('Unknown database', null)};
            }
        }
    }
})();