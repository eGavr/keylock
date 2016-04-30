var _ = require('lodash'),
    Stats = require('../lib/stats');

describe('Stats', function() {
    function createStats_(opts) {
        opts = _.defaults(opts || {}, {
            login: 'default-login',
            phrase: 'defaul-phrase',
            stats: []
        });

        return Stats.create(opts.login, opts.phrase, opts.stats);
    }

    it('should get speed stats', function() {
        createStats_({login: 'login', phrase: 'phrase', stats: [[1, 2, 3], [4, 5, 6]]}).getSpeedStats()
            .should.be.eql({login: 'login', labels: ['p', 'h', 'r', 'a', 's', 'e'], data: [[1, 2, 3], [4, 5, 6]]});
    });

    it('should get average speed stats', function() {
        createStats_({login: 'login', phrase: 'phrase', stats: [[1, 2, 3], [4, 5, 6]]}).getAverageSpeedStats()
            .should.be.eql({login: 'login', labels: ['p', 'h', 'r', 'a', 's', 'e'], data: [[2.5, 3.5, 4.5]]})
    });

    it('should get appriximate stats', function() {
        var input = {login: 'login', phrase: 'phrase', stats: [[0, 2, 3, 4, 5, 6], [0, 5, 4, 3, 2, 1]]};

        createStats_(input).getApproximateSpeedStats(2)
            .should.be.eql({login: 'login', labels: ['p', 'r', 's'], data: [[0, 2.5, 4.5], [0, 4.5, 2.5]]});
    });

    it('should get stats for rhythmograms', function() {
        var input = {login: 'login', phrase: 'phrase', 'stats': [[1, 2, 3, 4, 5, 6], [1, 3, 5, 7, 9, 11]]};

        createStats_(input).getRhythmogramStats()
            .should.be.eql({
                login: 'login',
                labels: ['h', 'r', 'a', 's', 'e'],
                data: [[1, 1, 1, 1, 1], [2, 2, 2, 2, 2]]
            });
    });

    it('should get average stats for rhythmograms', function() {
        var input = {login: 'login', phrase: 'phrase', 'stats': [[1, 2, 3, 4, 5, 6], [1, 3, 5, 7, 9, 11]]};

        createStats_(input).getAverageRhythmogramStats()
            .should.be.eql({login: 'login', labels: ['h', 'r', 'a', 's', 'e'], data: [[1.5, 1.5, 1.5, 1.5, 1.5]]});
    })

    it('should get bar stats for rhythmograms stats', function() {
        createStats_({login: 'login', stats: [[1, 6, 7, 10, 11, 12]]}).getBarStatsForRhythmogram(2)
            .should.be.eql({login: 'login', 'labels': ['1-3', '3-5', '5-7'], data: [[3, 1, 1]]});
    });
});
