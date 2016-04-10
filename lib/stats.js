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
    getSpeedStats: function() {
        return {login: this._login, labels: this._phrase, data: this._stats};
    },

    /**
     *
     */
    getAverageSpeedStats: function() {
        var speedStats = this.getSpeedStats();

        return this._getAverageStats(speedStats.labels, speedStats.data)
    },

    /**
     *
     */
    getAverageRhythmogramStats: function() {
        var rythmogramStats = this.getRhythmogramStats();

        return this._getAverageStats(rythmogramStats.labels, rythmogramStats.data);
    },

    /**
     *
     */
    _getAverageStats: function(labels, data) {
        return {
            login: this._login,
            labels: labels,
            data: [countData_()]
        };

        ///
        function countData_() {
            var sums = _.reduce(data, function(res, stat) {
                stat.forEach(function(elem, i) {
                    res[i] = res[i] ? res[i] + elem : elem;
                });
                return res;
            }, []);

            return sums.map(function(sum) { return sum / data.length; });
        }
    },

    /**
     *
     */
    getApproximateSpeedStats: function(n) {
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
    getBarStatsForRhythmogram: function(n) {
        var stats = this.getRhythmogramStats(),
            intervals = getIntervals_(_.flatten(stats.data)),
            labels = getLabels_(intervals),
            data = stats.data.map(function(stat) { return getData_(stat, intervals) });

        return {
            login: this._login,
            labels: labels,
            data: data
        }

        ///
        function getIntervals_(data) {
            var max = _.max(data),
                min = _.min(data),
                res = [],
                tmp = min;

            while(tmp <= max) {
                res.push({
                    from: tmp,
                    to: tmp + n
                });
                tmp += n;
            }

            return res;
        }

        ///
        function getLabels_(intervals) {
            return intervals.map(function(interval) {
                return interval.from + '-' + interval.to;
            });
        }

        ///
        function getData_(stat, intervals) {
            var res = _.fill(Array(intervals.length), 0);

            for(var i = 0; i < intervals.length; i++) {
                for(var j = 0; j < stat.length; j++) {
                    if(stat[j] >= intervals[i].from && stat[j] < intervals[i].to) res[i]++;
                }
            }

            return res;
        }
    },

    /**
     *
     */
    getAverageBarStatsForRhythmogram: function(n) {
        var stats = this.getBarStatsForRhythmogram(n);

        return this._getAverageStats(stats.labels, stats.data);
    },

    /**
     *
     */
    getFilteredBarStatsForRhythmogram: function(n) {
        var stats = this.getBarStatsForRhythmogram(n);

        for(var i = 0; i < stats.data.length; i++) {
            for(var j = 0; j < stats.data[i].length; j++) {
                if(stats.data[i][j] !== 0) continue;
                stats.labels[j] = -1;

                for(var k = i; k < stats.data.length; k++) {
                    stats.data[k][j] = -1;
                }

                for(var k = i - 1; k > -1; k--) {
                    stats.data[k][j] = -1;
                }
            }
        }

        stats.labels = _.without(stats.labels, -1);
        stats.data = _.map(stats.data, function(item) { return _.without(item, -1); });
        return stats;
    },

    /**
     *
     */
    getAverageFilteredBarStatsForRhythmogram: function(n) {
        var stats = this.getFilteredBarStatsForRhythmogram(n);

        return this._getAverageStats(stats.labels, stats.data);
    }
}, {
    /**
     *
     */
    create: function(login, phrase, stats) {
        return new Stats(login, phrase, stats);
    }
});
