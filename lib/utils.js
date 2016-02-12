var EOL = require('os').EOL,
    format = require('util').format,

    _ = require('lodash'),
    shelljs = require('shelljs'),

    data = require('../data/database'),

    logins = _.keys(data);

/**
 *
 */
exports.clearConsole = function() {
    shelljs.exec('clear');
};

/**
 *
 */
exports.isExistingLogin = function(login) {
    return login && _.includes(logins, login);
};

/**
 *
 */
exports.thr = function() {
    throw EOL + format.apply(null, arguments);
};

/**
 *
 */
exports.toLowerCase = function(str) {
    return str.toLowerCase();
};

/**
 *
 */
exports.getLinesCount = function(str) {
    return str.split(EOL).length;
};
