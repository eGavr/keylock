var limits = require('./limits');

exports.correlationCoefficient = function(correlationBetweenRhythmograms) {
    return correlationBetweenRhythmograms >= limits.correlationCoefficient;
};

exports.sumOfAbsoluteSubtractions = function(sumOfAbsoluteSubtractions) {
    return sumOfAbsoluteSubtractions <= limits.sumOfAbsoluteSubtractions;
};

exports.sumOfSquaredSubtractions = function(sumOfSquaredSubtractions) {
    return sumOfSquaredSubtractions <= limits.sumOfSquaredSubtractions;
};
