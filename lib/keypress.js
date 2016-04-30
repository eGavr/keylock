var EOL = require('os').EOL,

    chalk = require('chalk'),
    cursor = require('term-cursor'),
    keypress = require('keypress'),
    q = require('q'),

    Errors = require('./errors'),
    getLinesCount = require('./utils').getLinesCount,

    Abort = Errors.Abort,
    Mistake = Errors.Mistake,

    stdin = process.stdin,
    stdout = process.stdout,

    green = chalk.green,
    boldRed = chalk.bold.red;

/**
 *
 */
module.exports = function(phrase) {
    var deferred = q.defer(),
        startTime = 0,
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


        console.error(EOL + 'Abort!');
        process.exit(1);
        //return deferred.reject(new Abort());
    }

    ///
    function handleCorrectKey(key) {
        stdout.write(green(isEnter(key) ? EOL : key.sequence));
        ++counter;
        if(!startTime) {
            stat.push(0);
            startTime = new Date().getTime();
        } else {
            stat.push(new Date().getTime() - startTime);
        }
    }

    ///
    function handleMistake(symbol) {
        symbol !== EOL && stdout.write(boldRed(symbol)) && cursor.left(1);
        stdin.removeListener('keypress', handleKeypress);
        return deferred.reject(new Mistake());
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
