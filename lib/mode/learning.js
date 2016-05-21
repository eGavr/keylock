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

    function saveStats(result) {
        if(!result.length) process.exit(0);

        data[login].phraseIndex = phraseInfo.index;
        data[login].stats = result;

        return qfs.write('./data/database.json', JSON.stringify(data)).thenResolve(result);
    }
};

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
        return ask(continueLearning)
            .then(function(answers) {
                return answers.continueLearning === 'yes' ? learning(phrase, stats, debug) : stats;
            })
            .finally(function() {
                return ask([]);
            });
    }
}
