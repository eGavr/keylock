var EOL = require('os').EOL,
    format = require('util').format,

    _ = require('lodash'),

    data = require('../data/database'),
    phrases = require('../data/phrases'),

    logins = _.keys(data);

exports.isExistingLogin = function(login) {
    return login && _.includes(logins, login);
};

exports.thr = function() {
    throw EOL + format.apply(null, arguments);
};

exports.toLowerCase = function(str) {
    return str.toLowerCase();
};

exports.getLinesCount = function(str) {
    return str.split(EOL).length;
};

exports.getPhrase = function(index) {
    index = typeof index === 'undefined' ? _.random(phrases.length - 1) : index;

    return {index: index, content: phrases[index].join(EOL)};
};
