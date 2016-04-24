var EOL = require('os').EOL,
    path = require('path'),

    chalk = require('chalk'),
    q = require('q'),
    qfs = require('q-io/fs'),
    cursor = require('term-cursor'),

    ask = require('../ask'),
    data = require('../../data/database'),
    Errors = require('../errors'),
    keypress = require('../keypress'),
    maths = require('../maths'),
    possibleQuestion = require('../possible-questions'),
    report = require('../report'),
    shelljs = require('../shelljs'),
    Stats = require('../stats'),
    utils = require('../utils'),

    Abort = Errors.Abort,
    Mistake = Errors.Mistake,

    oneMoreLearning = possibleQuestion.oneMoreLearning,
    continueLearning = possibleQuestion.continueLearning,

    getLinesCount = utils.getLinesCount,
    getPhrase = utils.getPhrase;

/**
 *
 */
module.exports = function(login, debug) {
    data[login] = data[login] || {};

    var stats = data[login].stats || [],
        phraseInfo = getPhrase(data[login].phraseIndex),
        phrase = phraseInfo.content;

    return learning(phrase, stats, debug)
        .then(saveStats)
        .then(Stats.create.bind(null, login, phrase))
        .then(report.learning)
        .then(function(stats) {
            debug && shelljs.open(path.join('reports', 'learning', login, 'index.html'));
            return stats;
        })
        .finally(function() {
            return ask([]);
        });

    ///
    function saveStats(result) {
        if(!result.length) process.exit(0);

        data[login].phraseIndex = phraseInfo.index;
        data[login].stats = result;

        return qfs.write('./data/database.json', JSON.stringify(data)).thenResolve(result);
    }
};

/**
 *
 */
function learning(phrase, stats, debug) {
    shelljs.clearConsole();
    console.log(phrase);
    cursor.up(getLinesCount(phrase))

    return keypress(phrase)
        .then(function(stat) {
            shelljs.clearConsole();
            stats.push(stat);
        })
        .then(function() {
            // var correlatedStats = findCorrelatedStats(stats, debug);

            // if(stats.length > 1 && correlatedStats.length) return correlatedStats;

            return askAndStartLearning_();
        })
        .fail(function(err) {
            return err instanceof Mistake && handleMistake_()
                || err instanceof Abort && q.reject()
                || q.reject();
        });

    function handleMistake_() {
        shelljs.clearConsole();
        console.error(chalk.red('You have made a mistake. The previous learning will be ignored.\n'));

        return askAndStartLearning_();
    }

    function askAndStartLearning_() {
        // return ask(oneMoreLearning)
        //     .then(function() {
        //         return learning(phrase, stats, debug);
        //     });

        return ask(continueLearning)
            .then(function(answers) {
                return answers.continueLearning === 'yes' ? learning(phrase, stats, debug) : stats;
            })
            .finally(function() {
                return ask([]);
            });
    }
}

///
function findCorrelatedStats(stats, debug) {
    for(var i = 0; i < stats.length; i++) {
        for(var j = i + 1; j < stats.length; j++) {
            var possibleStats = [stats[i], stats[j]],
                _stats = Stats.create('', '', possibleStats),
                rhythmogramStats = _stats.getRhythmogramStats(),
                frequencyStats = _stats.getFilteredBarStatsForRhythmogram(50);

            var correlationBetweenRhythmograms =
                    maths.getCorrelationCoefficient(rhythmogramStats.data[0], rhythmogramStats.data[1]),
                correlationBetweenFrequencyStats =
                    maths.getCorrelationCoefficient(frequencyStats.data[0], frequencyStats.data[1]);

            if(debug) {
                console.log('%s-е и %s-е обучение', i + 1, j + 1);
                console.log('Коэффициент корреляции ритмограмм обучения и применения –>', correlationBetweenRhythmograms);
                console.log('Коэффициент корреляции между графиками частот ритмограмм обучения и применения –>',
                    correlationBetweenFrequencyStats);
                console.log()
            }

            if(maths.isAppropriateCorrelation(correlationBetweenRhythmograms, correlationBetweenFrequencyStats)) {
                if(debug) console.log('Выбираем %s-е и %s-е обучение', i + 1, j + 1);
                return possibleStats;
            }
        }
    }

    return [];
}

