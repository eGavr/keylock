var qfs = require('q-io/fs'),
    cursor = require('term-cursor'),

    ask = require('../ask'),
    data = require('../../data/database'),
    keypress = require('../keypress'),
    getRandomPhrase = require('../phrases'),
    continueLearning = require('../possible-questions').continueLearning,
    utils = require('../utils'),

    clearConsole = utils.clearConsole,
    getLinesCount = utils.getLinesCount;

/**
 *
 */
module.exports = function(login) {
    data[login] = data[login] || {};

    var stats = data[login].stats || [],
        phraseInfo = getRandomPhrase(data[login].phraseIndex);

    return learning(phraseInfo.content, stats)
        .then(saveStats)
        .then(makeCharts);

    ///
    function saveStats(result) {
        data[login].phraseIndex = phraseInfo.index;
        data[login].stats = result;

        return qfs.write('./data/database.json', JSON.stringify(data));
    }

    ///
    function makeCharts() {

    }
};

/**
 *
 */
function learning(phrase, stats) {
    clearConsole();
    console.log(require('chalk').strikethrough(phrase));
    cursor.up(getLinesCount(phrase))

    return keypress(phrase)
        .then(function(stat) {
            clearConsole();
            stats.push(stat);
        })
        .then(ask.bind(null, continueLearning))
        .then(function(answers) {
            return answers.continueLearning === 'yes' ? learning(phrase, stats) : stats;
        });
}

