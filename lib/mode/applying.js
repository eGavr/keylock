var path = require('path'),

    cursor = require('term-cursor'),

    ask = require('../ask'),
    data = require('../../data/database.json'),
    keypress = require('../keypress'),
    maths = require('../maths'),
    possibleQuestion = require('../possible-questions'),
    report = require('../report'),
    shelljs = require('../shelljs'),
    Stats = require('../stats'),
    utils = require('../utils'),

    showApplyingCharts = possibleQuestion.showApplyingCharts,

    getLinesCount = utils.getLinesCount,
    getPhrase = utils.getPhrase;

/**
 *
 */
module.exports = function(login) {
    var phrase = getPhrase(data[login].phraseIndex).content;

    return applying(phrase)
        .then(function(stats) {
            // FIXME: это хак, чтобы программа не зависала, похоже связано с тем, что мы слушаем события нажатия клавиш
            return ask([]).thenResolve(stats);
        })
        .then(function(stats) {
            var learningStats = new Stats(login, phrase, data[login].stats),
                applyingStats = new Stats(login, phrase, stats);

            var averageLearningSpeedData = learningStats.getAverageSpeedStats().data[0],
                averageLearningRhythmoData = learningStats.getAverageRhythmogramStats().data[0],

                averageApplyingSpeedData = applyingStats.getAverageSpeedStats().data[0],
                averageApplyingRhythmoData = applyingStats.getAverageRhythmogramStats().data[0];

            console.log('Сумма разностей модулей скорости набора –>',
                maths.getSumOfAbsoluteSubtractions(averageLearningSpeedData, averageApplyingSpeedData));
            console.log('Сумма разностей квадратов скорости набора –>',
                maths.getSumOfSquaredSubtractions(averageLearningSpeedData, averageApplyingSpeedData));

            console.log('Математическое ожидание ритмограммы обучения –>',
                maths.getExpectedValue(averageLearningRhythmoData));
            console.log('Математическое ожидание ритмограммы применения –>',
                maths.getExpectedValue(averageApplyingRhythmoData));

            console.log('Дисперсия ритмограммы обучения –>',
                maths.getDispersion(averageLearningRhythmoData));
            console.log('Дисперсия ритмограммы применения –>',
                maths.getDispersion(averageApplyingRhythmoData));

            console.log('Среднеквадратичное отклонение ритмограммы обучения –>',
                maths.getStandardDeviation(averageLearningRhythmoData));
            console.log('Среднеквадратичное отклонение ритмограммы обучения –>',
                maths.getStandardDeviation(averageApplyingRhythmoData));

            console.log('Коэффициент корреляции ритмограмм обучения и применения –>',
                maths.getCorrelationCoefficient(averageLearningRhythmoData, averageApplyingRhythmoData));

            var _stats = new Stats(login, phrase, [averageLearningSpeedData, averageApplyingSpeedData]),
                _frequencyStats = _stats.getBarStatsForRhythmogram(50).data,
                _filteredFrequencyStats = _stats.getFilteredBarStatsForRhythmogram(50).data;

            console.log('Коэффициент корреляции между графиками частот ритмограмм обучения и применения –>',
                maths.getCorrelationCoefficient(_frequencyStats[0], _frequencyStats[1]));

            // console.log('Коэффициент корреляции между отфильтроваными графиками частот ритмограмм обучения и применения –>',
            //     maths.getCorrelationCoefficient(_filteredFrequencyStats[0], _filteredFrequencyStats[1]));


            return report.applying(new Stats(login, phrase, [averageLearningSpeedData, averageApplyingSpeedData]));
        })
        .then(function() {
            shelljs.open(path.join('reports', 'applying', login, 'index.html'));
        })

};

function applying(phrase) {
    shelljs.clearConsole();
    console.log(phrase);
    cursor.up(getLinesCount(phrase));

    return keypress(phrase)
        .then(function(stats) {
            shelljs.clearConsole();
            return [stats];
        });
}
