var inherit = require('inherit'),
    _ = require('lodash'),

    maths = require('./maths');

/**
 *
 */
var Stats = module.exports = inherit({
    /**
     *
     */
    __constructor: function(login, phrase, stats) {
        this._login = login;
        this._phrase = phrase.split('');
        this._stats = stats;
    },

    /**
     *
     */
    getLogin: function() {
        return this._login;
    },

    /**
     *
     */
    getSumOfAbsoluteSubtractions: function() {
        return this._getSumOfSubtractions(_.identity);
    },

    /**
     *
     */
    getSumOfSquaredSubtractions: function() {
        return this._getSumOfSubtractions(function(n) { return n * n; })
    },

    /**
     *
     */
    _getSumOfSubtractions: function(cb) {
        var stats = this._stats,
            res = stats[0];

        for(var i = 1; i < stats.length; ++i) {
            var stat = stats[i];
            for(var j = 0; j < stat.length; ++j) {
                res[j] = Math.abs(res[j] - stat[j]);
            }
        }

        return _(res).map(cb).thru(_.sum).value();
    },

    /**
     *
     */
    getLineStats: function() {
        return {login: this._login, labels: this._phrase, data: this._stats};
    },

    /**
     *
     */
    getAverageLineStats: function(n) {
        return {
            login: this._login,
            labels: _(this._phrase)
                .filter(function(symbol, index) {
                    return index && index % n === 0;
                })
                .thru(_.concat.bind(null, [_.first(this._phrase)]))
                .value(),
            data: _.map(this._stats, function(stat) {
                return _(stat)
                    .tail()
                    .chunk(n)
                    .filter(function(item) {
                        return item.length === n;
                    })
                    .map(function(item) {
                        return _.sum(item) / n;
                    })
                    .thru(_.concat.bind(null, [_.first(stat)]))
                    .value()
            })
        };
    },

    /**
     *
     */
    getRhythmogramStats: function() {
        return {
            login: this._login,
            labels: _.tail(this._phrase),
            data: _.map(this._stats, function(stat) {
                var res = [];
                for(var index = 1; index < stat.length; ++index) {
                    res.push(stat[index] - stat[index - 1]);
                }
                return res;
            })
        };
    },

    /**
     *
     */
    getExpectedValuesForRhythmograms: function() {
        return this.getRhythmogramStats().data.reduce(function(res, stat) {
            res.push(_.sum(stat) / stat.length);
            return res;
        }, []);
    },

    /**
     *
     */
    getDispersionsForRhythmograms: function() {
        var expectedValues = this.getExpectedValuesForRhythmograms();

        return this.getRhythmogramStats().data.reduce(function(res, stat, index) {
            var expectedValue = expectedValues[index];
            res.push(_.sum(stat.map(function(i) { return i * i; })) / stat.length - expectedValue * expectedValue);
            return res;
        }, []);
    },

    /**
     *
     */
    getCorrelationCoefficientForRhythmograms: function() {
        return maths.getCorrelationCoefficient(_.takeRight(this.getRhythmogramStats().data, 2));
    },

    /**
     *
     */
    getBarStatsForRythmogram: function() {
        rythmogramStats = this.getRhythmogramStats();

        var stats = getStats_(rythmogramStats.data),
            labels = getLabels_(stats);

        return {
            login: this._login,
            labels: labels,
            data: _.map(stats, function(stat) {
                return _.reduce(labels, function(res, label) {
                    res.push(stat[label] ? stat[label] : 0);
                    return res;
                }, []);
            })
        };

        ///
        function getStats_(data) {
            return _(data)
                .map(function(stat) {
                    return _.reduce(stat, function(res, item) {
                        res[item] = res[item] ? (res[item] + 1) : 1;
                        return res;
                    }, {});
                })
                .value();
        }

        ///
        function getLabels_(stats) {
            return _(stats)
                .map(_.keys)
                .flatten()
                .uniq()
                .sortBy()
                .value();
        }
    }
}, {
    /**
     *
     */
    create: function(login, phrase, stats) {
        return new Stats(login, phrase, stats);
    }
});
