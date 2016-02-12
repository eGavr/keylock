var EOL = require('os').EOL,

    _ = require('lodash');

///
var phrases = [
    [
        'Aaaaaaa',
        'Aaaaaaa'
    ],
    [
        'Bbbbbbbb',
        'bbbbbbbb'
    ]
];

/**
 *
 */
module.exports = function(index) {
    index = index || _.random(phrases.length - 1);

    return {index: index, content: phrases[index].join(EOL)};
};
