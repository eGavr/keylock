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

    it('should get the sum of absolute subtractions', function() {
        createStats_({stats: [[5, 4, 3], [6, 2, 1], [3, 4, 5]]}).getSumOfAbsoluteSubtractions()
            .should.be.equal(7)
    });

    it('should get the sum of squared subtractions', function() {
        createStats_({stats: [[5, 4, 3], [6, 2, 1], [3, 4, 5]]}).getSumOfSquaredSubtractions()
            .should.be.equal(17)
    });

    it('should get line stats', function() {
        createStats_({login: 'login', phrase: 'phrase', stats: [[1, 2, 3], [4, 5, 6]]}).getLineStats()
            .should.be.eql({login: 'login', labels: ['p', 'h', 'r', 'a', 's', 'e'], data: [[1, 2, 3], [4, 5, 6]]});
    });

    it('should get average stats', function() {
        var input = {login: 'login', phrase: 'phrase', stats: [[0, 2, 3, 4, 5, 6], [0, 5, 4, 3, 2, 1]]};

        createStats_(input).getAverageLineStats(2)
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

    it('should get expected values for rhythmograms', function() {
        createStats_({stats: [[1, 2, 3, 4, 5, 6], [1, 3, 5, 7, 9, 11]]}).getExpectedValuesForRhythmograms()
            .should.be.eql([1, 2]);
    });

    it('should get dispersions for rhythmograms', function() {
        createStats_({stats: [[1, 2, 3, 4, 5, 6], [1, 3, 5, 7, 9, 11]]}).getDispersionsForRhythmograms()
            .should.be.eql([0, 0]);
    });

    it('should get bar stats from rhythmograms stats', function() {
        createStats_({login: 'login', stats: [[1, 2, 3, 4, 5, 6], [1, 3, 5, 7, 9, 11]]}).getBarStatsForRythmogram()
            .should.be.eql({login: 'login', labels: ['1', '2'], data: [[5, 0], [0, 5]]});
    });
});
