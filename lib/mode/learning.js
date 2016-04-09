var path = require('path'),

    qfs = require('q-io/fs'),
    cursor = require('term-cursor'),

    ask = require('../ask'),
    data = require('../../data/database'),
    keypress = require('../keypress'),
    possibleQuestion = require('../possible-questions'),
    report = require('../report'),
    shelljs = require('../shelljs'),
    Stats = require('../stats'),
    utils = require('../utils'),

    continueLearning = possibleQuestion.continueLearning,
    showLearningChart = possibleQuestion.showLearningChart,

    getLinesCount = utils.getLinesCount,
    getPhrase = utils.getPhrase;

/**
 *
 */
module.exports = function(login) {
    data[login] = data[login] || {};

    var stats = data[login].stats || [],
        phraseInfo = getPhrase(data[login].phraseIndex),
        phrase = phraseInfo.content;

    return learning(phrase, stats)
        .then(saveStats)
        .then(Stats.create.bind(null, login, phrase))
        .then(report.generate)
        .then(function(stats) {
            return ask(showLearningChart)
                .then(function(answers) {
                    return answers.showLearningChart === 'yes' &&
                        shelljs.open(path.join('reports', login, 'index.html'));
                })
                .thenResolve(stats);
        })
        .then(function(stats) {
            console.log('Сумма разностей модулей –> %s', stats.getSumOfAbsoluteSubtractions());
            console.log('Сумма разностей квадратов –> %s', stats.getSumOfSquaredSubtractions());
            console.log('Математическое ожидание ритмограмм –> %s', stats.getExpectedValuesForRhythmograms().join(', '));
            console.log('Дисперсии ритмограмм –> %s', stats.getDispersionsForRhythmograms().join(', '));
            console.log('Коэффициент корреляции двух последнийх ритмограмм –> %s', stats.getCorrelationCoefficientForRhythmograms());
        });

    ///
    function saveStats(result) {
        data[login].phraseIndex = phraseInfo.index;
        data[login].stats = result;

        return qfs.write('./data/database.json', JSON.stringify(data)).thenResolve(result);
    }
};

/**
 *
 */
function learning(phrase, stats) {
    shelljs.clearConsole();
    console.log(phrase);
    cursor.up(getLinesCount(phrase))

    return keypress(phrase)
        .then(function(stat) {
            shelljs.clearConsole();
            stats.push(stat);
        })
        .then(ask.bind(null, continueLearning))
        .then(function(answers) {
            return answers.continueLearning === 'yes' ? learning(phrase, stats) : stats;
        });
}

