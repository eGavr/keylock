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
    showLearningCharts = possibleQuestion.showLearningCharts,

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
        .then(report.learning)
        .then(function(stats) {
            // return ask(showLearningCharts)
            //     .then(function(answers) {
            //         return answers.showLearningCharts === 'yes' &&
            //             shelljs.open(path.join('reports', 'learning', login, 'index.html'));
            //     })
            //     .thenResolve(stats);
            shelljs.open(path.join('reports', 'learning', login, 'index.html'));
            return stats;
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

