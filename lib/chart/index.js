var format = require('util').format,
    inherit = require('inherit'),
    _ = require('lodash');

module.exports = inherit({
    __constructor: function(stats, customOpts) {
        customOpts = customOpts || {};

        this._options = _.merge({
            legend: {position: 'bottom'},
            title: {display: true, text: stats.login}
        }, this._options, customOpts.options);

        this._datasetsOptions = _.merge({}, this._datasetsOptions, customOpts.datasetsOptions);
        this._config = this._configure(stats);
    },

    _configure: function(stats) {
        return {
            type: this._type,
            data: this._formatData(stats),
            options: this._options
        };
    },

    _formatData: function(stats) {
        return {
            labels: stats.labels,
            datasets: _.map(stats.data, function(stat, index) {
                return _.extend(_.clone(this._datasetsOptions), {
                    label: this._datasetsOptions.labels && this._datasetsOptions.labels[index] || formatLabel_(index),
                    data: stat
                });
            }.bind(this))
        };

        function formatLabel_(index) {
            return (index === 0 && '1st'
                || index === 1 && '2nd'
                || index === 2 && '3rd'
                || format('%sth', index + 1)) + ' learning';
        }
    },

    getConfig: function() {
        return this._config;
    }
});
