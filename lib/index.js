var _ = require('lodash'),

    possibleQuestions = require('./possible-questions');

/**
 *
 */
module.exports = function(opts) {
    var questions = possibleQuestions.initFromOpts(opts);

    return questions.ask()
        .then(_.merge.bind(_, opts))
        .then(function(answers) {
            return require('./mode/' + answers.mode)(answers.login);
        });
};
