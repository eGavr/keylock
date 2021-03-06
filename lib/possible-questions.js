var ask = require('./ask'),
    utils = require('./utils'),

    isExistingLogin = utils.isExistingLogin,
    thr = utils.thr,
    toLowerCase = utils.toLowerCase;

/**
 *
 */
exports.initFromOpts = function(opts) {
    validateOpts(opts);

    var questions = [{
        type: 'list',
        name: 'mode',
        message: 'Choose the mode',
        choices: ['Learning', 'Applying'],
        filter: toLowerCase,
        when: function() { return !opts.mode; }
    }, {
        type: 'input',
        name: 'login',
        message: 'Enter a login',
        validate: function(login) { return /^\w+$/.test(login) || 'Enter a valid login!'; },
        when: function(answers) { return !opts.login && (opts.mode === 'learning' || answers.mode === 'learning'); }
    }, {
        type: 'input',
        name: 'login',
        message: 'Enter a login',
        validate: function(login) { return isExistingLogin(login) || 'No such login!'; },
        when: function(answers) { return !opts.login && (opts.mode === 'applying' || answers.mode === 'applying'); }
    }, {
        type: 'list',
        name: 'operateWithExistingLogin',
        message: 'Are you sure that you want to operate with the existing login',
        choices: ['Yes', 'No'],
        filter: toLowerCase,
        when: function(answers) {
            return !opts.force && (opts.mode === 'learning' || answers.mode === 'learning')
                && isExistingLogin(opts.login || answers.login);
        }
    }, {
        type: 'checkbox',
        name: 'criterias',
        message: 'Choose classification criterias',
        choices: [
            {name: 'Correlation coefficient', value: 'correlationCoefficient', checked: true},
            {name: 'Sum of absolute subtractions', value: 'sumOfAbsoluteSubtractions'},
            {name: 'Sum of squared subtractions', value: 'sumOfSquaredSubtractions'}
        ],
        validate: function(criterias) { return Boolean(criterias.length) || 'Choose some criteria!' },
        when: function(answers) {
            return (opts.mode === 'applying' || answers.mode === 'applying') && !opts.criterias;
        }
    }];

    return {
        ask: function() {
            return ask(questions)
                .then(function(answers) {
                    answers.operateWithExistingLogin === 'no' && thr('Abort!');
                    answers.mode === 'applying' && opts.login && !isExistingLogin(opts.login) && thr('No such login!');

                    return answers;
                });
        }
    };

    ///
    function validateOpts() {
        var mode = opts.mode,
            login = opts.login;

        mode && (mode !== 'learning' && mode !== 'applying') && thr('Invalid mode!');
        mode === 'applying' && login && !isExistingLogin(login) && thr('No such login!');
    }
};

///
exports.continueLearning = {
    type: 'list',
    name: 'continueLearning',
    message: 'Would you like to continue the learning',
    choices: ['Yes', 'No'],
    filter: toLowerCase
};

exports.oneMoreLearning = {
    type: 'list',
    name: 'oneMoreLearning',
    message: 'We need one more learning, ready?',
    choices: ['Yes'],
    filter: toLowerCase
};

exports.oneMoreApplying = {
    type: 'list',
    name: 'oneMoreApplying',
    message: 'Would you like to try again',
    choices: ['Yes', 'No'],
    filter: toLowerCase
};
