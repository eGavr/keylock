var path = require('path'),

    qfs = require('q-io/fs'),
    cursor = require('term-cursor'),

    ask = require('../ask'),
    chart = require('../chart'),
    data = require('../../data/database'),
    keypress = require('../keypress'),
    possibleQuestion = require('../possible-questions'),
    shelljs = require('../shelljs'),
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
        .then(chart.bind(null, login, phrase))
        .then(ask.bind(null, showLearningChart))
        .then(function(answers) {
            return answers.showLearningChart === 'yes' && shelljs.open(path.join('charts', login + '.html'));
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

