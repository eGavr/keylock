var format = require('util').format,

    shelljs = require('shelljs');

/**
 *
 */
exports.clearConsole = function() {
    shelljs.exec('clear');
};

/**
 *
 */
exports.open = function(filepath) {
    shelljs.exec(format('open %s', filepath));
};
