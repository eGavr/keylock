var EOL = require('os').EOL,

    chalk = require('chalk'),
    cursor = require('term-cursor'),
    keypress = require('keypress'),
    q = require('q'),

    getLinesCount = require('./utils').getLinesCount,

    stdin = process.stdin,
    stdout = process.stdout,

    green = chalk.green,
    boldRed = chalk.bold.red;

/**
 *
 */
module.exports = function(phrase) {
    var deferred = q.defer(),
        startTime = new Date().getTime(),
        splitted = phrase.split(''),
        stat = [],
        counter = 0;

    keypress(process.stdin);

    var handleKeypress = function(ch, key) {
        if(isStopSignal(key)) {
            return handleStopSignal();
        }

        var currSymbol = splitted[counter];
        isEqual(currSymbol, key) ? handleCorrectKey(key) : handleMistake(currSymbol);

        if(counter === splitted.length) {
            return stopKeypress();
        }
    };

    stdin.on('keypress', handleKeypress);

    stdin.setRawMode(true);
    stdin.resume();

    return deferred.promise;

    ///
    function handleStopSignal() {
        stdin.pause();
        cursor.down(getLinesCount(phrase));

        return deferred.reject(EOL + 'Abort!');
    }

    ///
    function handleCorrectKey(key) {
        stdout.write(green(isEnter(key) ? EOL : key.sequence));
        ++counter && stat.push(new Date().getTime() - startTime);
    }

    ///
    function handleMistake(symbol) {
        symbol !== EOL && stdout.write(boldRed(symbol)) && cursor.left(1);
    }

    ///
    function stopKeypress() {
        stdin.removeListener('keypress', handleKeypress);

        return deferred.resolve(stat);
    }
};

/**
 *
 */
function isStopSignal(key) {
    return key && key.ctrl && (key.name === 'c' || key.name === 'z');
}

/**
 *
 */
function isEnter(key) {
    return key && (key.sequence === '\n' || key.sequence === '\r');
}

/**
 *
 */
function isEqual(symbol, key) {
    return key && key.sequence === symbol || isEnter(key) && symbol == EOL;
}
