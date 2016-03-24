var path = require('path'),
    EOL = require('os').EOL,
    format = require('util').format,

    _ = require('lodash'),
    qfs = require('q-io/fs');


/**
 *
 */
module.exports = function(login, phrase, stats) {
    return qfs.read(path.join(__dirname, 'template.html'))
        .then(function(source) {
            return templateEngine(source, {
                title: login,
                symbols: toString.arrayOfStrings(phrase.split('')),
                datasets: formatDatasets(stats)
            });
        })
        .then(qfs.write.bind(qfs, path.resolve('charts', login + '.html')));

};

///
var toString = {
    arrayOfStrings: function(arr) {
        return '[' + arr.map(function(item) {
            return '\'' +  (item === EOL ? '\\n' : item) + '\'';
        }) + ']';
    },

    arrayOfObjects: function(arr) {
        return '[' + arr.join(',') + ']';
    }
};

/**
 *
 */
function formatDatasets(stats) {
    return _(stats)
        .map(function(stat, index) {
            return format('{label: \'%s\', data: %s, fill: false, borderDash: [0, 0]}',
                formatLabel(index), toString.arrayOfStrings(stat));
        })
        .thru(toString.arrayOfObjects)
        .value();

    ///
    function formatLabel(index) {
        return (index === 0 && '1st'
            || index === 1 && '2nd'
            || index === 2 && '3rd'
            || format('%sth', index + 1)) + ' learning';
    }
}

/**
 *
 */
function templateEngine(source, params) {
    _.forEach(params, function(value, key) {
        source = source.replace(format('{{%s}}', key), value);
    });

    return source;
}
