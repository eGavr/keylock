var path = require('path'),
    format = require('util').format,

    chalk = require('chalk'),
    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    cursor = require('term-cursor'),

    ask = require('../ask'),
    data = require('../../data/database.json'),
    Errors = require('../errors'),
    isAppropriate = require('../criteria'),
    keypress = require('../keypress'),
    maths = require('../maths'),
    possibleQuestion = require('../possible-questions'),
    report = require('../report'),
    shelljs = require('../shelljs'),
    Stats = require('../stats'),
    utils = require('../utils'),

    Mistake = Errors.Mistake,
    Abort = Errors.Abort,

    oneMoreApplying = possibleQuestion.oneMoreApplying,

    showApplyingCharts = possibleQuestion.showApplyingCharts,

    getLinesCount = utils.getLinesCount,
    getPhrase = utils.getPhrase;

module.exports = function(login, debug, criterias) {
    var phrase = getPhrase(data[login].phraseIndex).content;

    return applying(phrase)
        .then(handleSuccessApplying_)
        .then(function() {
            debug && shelljs.open(path.join('reports', 'applying', login, 'index.html'));
        })
        .finally(function() {
            return ask([]);
        });

    function handleSuccessApplying_(stats) {
        var learningStats = new Stats(login, phrase, data[login].stats),
            applyingStats = new Stats(login, phrase, stats);

        var averageLearningSpeedData = learningStats.getAverageSpeedStats().data[0],
            averageLearningRhythmoData = learningStats.getAverageRhythmogramStats().data[0],

            averageApplyingSpeedData = applyingStats.getAverageSpeedStats().data[0],
            averageApplyingRhythmoData = applyingStats.getAverageRhythmogramStats().data[0];

        var frequencyStats = new Stats(login, phrase, [averageLearningSpeedData, averageApplyingSpeedData])
                .getFilteredBarStatsForRhythmogram(50).data;

        var correlationCoefficient = maths.getCorrelationCoefficient(averageLearningRhythmoData, averageApplyingRhythmoData),
            sumOfAbsoluteSubtractions = maths.getSumOfAbsoluteSubtractions(averageLearningRhythmoData, averageApplyingRhythmoData),
            sumOfSquaredSubtractions = maths.getSumOfSquaredSubtractions(averageLearningRhythmoData, averageApplyingRhythmoData);

        if (debug) {
            console.log('Коэффициент корреляции между ритмограммами обучения и применения –>', correlationCoefficient);
        }

        return report.applying(new Stats(login, phrase, [averageLearningSpeedData, averageApplyingSpeedData]))
            .then(function() {
                if(!isAppropriateUser(criterias, {correlationCoefficient, sumOfAbsoluteSubtractions, sumOfSquaredSubtractions})) {
                    console.log(chalk.bold.red((format('You are not \'%s\'!', login))));
                    return;
                }

                console.log(chalk.bold.green(format('You are \'%s\'!', login)));

                return updateStats(login, stats);
            });
    }
};

function applying(phrase) {
    shelljs.clearConsole();
    console.log(phrase);
    cursor.up(getLinesCount(phrase));

    return keypress(phrase)
        .then(function(stats) {
            shelljs.clearConsole();
            return [stats];
        })
        .fail(function(err) {
            if(err instanceof Mistake) {
                shelljs.clearConsole();
                console.error(chalk.red('You have made a mistake. Try again.\n'));

                return ask(oneMoreApplying)
                    .then(function(answers) {
                        return answers.oneMoreApplying === 'yes' ? applying(phrase) : process.exit(1);
                    });
            }

            if(err instanceof Abort) q.reject();
        })
}

function updateStats(login, stats) {
    var oldStats = data[login].stats;

    var newStats = _(oldStats)
        .tail()
        .concat(stats)
        .value();

    data[login].stats = newStats;

    return qfs.write('./data/database.json', JSON.stringify(data));
}

function isAppropriateUser(criterias, values) {
    return _.every(criterias, function(criteria) {
        return isAppropriate[criteria](values[criteria]);
    });
}
