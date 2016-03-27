var path = require('path'),

    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),

    Chart = require('../chart'),
    LineChart = require('../chart/line'),
    BarChart = require('../chart/bar'),

    REPORTS_DIR = path.resolve('reports'),
    TEMPLATES_DIR = path.join(__dirname, 'template');

/**
 *
 */
exports.generate = function(stats) {
    var login = stats.getLogin(),
        reportDir = path.join(REPORTS_DIR, login),
        configs = getConfigsForCharts(stats);

    return _(['index.html', 'index.js', 'index.css'])
        .map(readSource_)
        .thru(q.all)
        .value()
        .spread(templateSources_)
        .then(mkReportDir_)
        .then(saveReport_)
        .then(q.all)
        .thenResolve(stats);

    ///
    function readSource_(filename) {
        return qfs.read(path.join(TEMPLATES_DIR, filename));
    }

    ///
    function templateSources_(html, js, css) {
        return {
            html: _.template(html)({login: login, configs: configs}),
            js: _.template(js)({configs: JSON.stringify(configs)}),
            css: css
        };
    }

    ///
    function mkReportDir_(files) {
        return qfs.makeTree(reportDir).thenResolve(files)
    }

    ///
    function saveReport_(files) {
        return _.map(files, function(content, type) {
            return qfs.write(path.join(reportDir, 'index.' + type), content);
        });
    }
};

/**
 *
 */
function getConfigsForCharts(stats) {
    var rawLineChart = new LineChart(stats.getLineStats(), formatTitle_('Speed dependency')),
        averageLineChart = new LineChart(stats.getAverageLineStats(5), formatTitle_('Average speed dependency (5)')),
        rhythmogramLineChart = new LineChart(stats.getRhythmogramStats(), formatTitle_('Rhythmogram'));
        barChartForRhythmogram = new BarChart(stats.getBarStatsForRythmogram(), {
            options: {title: {text: 'Bar chart for Rhythmogram'}},
            datasetsOptions: {hidden: true}
        });

    return _.invokeMap([
        rawLineChart,
        averageLineChart,
        rhythmogramLineChart,
        barChartForRhythmogram
    ], Chart.prototype.getConfig);

    ///
    function formatTitle_(title) {
        return {options: {title: {text: title}}};
    }
}
