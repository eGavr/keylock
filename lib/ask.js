var inquirer = require('inquirer'),
    q = require('q');

module.exports = function(questions) {
    questions = [].concat(questions);

    var deferred = q.defer();

    inquirer.prompt(questions, function(answers) {
        deferred.resolve(answers);
    });

    return deferred.promise;
};
