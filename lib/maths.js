var _ = require('lodash');

/**
 *
 */
exports.getCorrelationCoefficient = function(data1, data2) {
    var data = [data1, data2],
        n = _.first(data).length,
        sums = data.map(function(stat) {
            return _.sum(stat);
        }),
        sumOfProducts = countSumOfProducts_(data),
        sumsOfSquares = data.map(function(stat) {
            return _.sum(stat.map(function(i) {return i * i;}));
        }),
        productOfSums = sums.reduce(function(res, sum) {
            res *= sum;
            return res;
        }, 1);

    return (n * sumOfProducts - productOfSums) / countDenominator_(sums, sumsOfSquares, n);

    ///
    function countSumOfProducts_() {
        var res = _.fill(Array(n), 1);

        for(var i = 0; i < data.length; ++i){
            var stat = data[i];
            for(var j = 0; j < stat.length; ++j) {
                res[j] *= stat[j];
            }
        }

        return _.sum(res);
    }

    ///
    function countDenominator_() {
        var tmp = [];

        for(var i = 0; i < data.length; ++i) {
            tmp[i] = n * sumsOfSquares[i] - sums[i] * sums[i];
        }

        return Math.sqrt(tmp.reduce(function(res, item) {
            res *= item;
            return res;
        }, 1));
    }
};

/**
 *
 */
exports.getSumOfAbsoluteSubtractions = function(data1, data2) {
    return getSumOfSubtractions(data1, data2, _.identity);
};

var double = function(n) { return n * n; };

///
exports.getSumOfSquaredSubtractions = function(data1, data2) {
    return getSumOfSubtractions(data1, data2, double);
};

/**
 *
 */
var getSumOfSubtractions = function(data1, data2, cb) {
    var res = [];

    data1.forEach(function(elem, i) {
        res[i] = Math.abs(data1[i] - data2[i]);
    });

    return _(res).map(cb).thru(_.sum).value();
};


/**
 *
 */
var getExpectedValue = exports.getExpectedValue = function(data) {
    return _.sum(data) / data.length;
}

var getDispersion = exports.getDispersion = function(data) {
    return _.sum(_.map(data, double)) / data.length - double(getExpectedValue(data));
}

exports.getStandardDeviation = function(data) {
    return Math.sqrt(getDispersion(data));
};
