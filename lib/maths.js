var _ = require('lodash');

/**
 *
 */
exports.getCorrelationCoefficient = function(data) {
    var n = _.first(data).length,
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
