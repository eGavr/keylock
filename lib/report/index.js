var path = require('path'),

    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),

    Chart = require('../chart'),
    LineChart = require('../chart/line'),
    BarChart = require('../chart/bar'),

    REPORTS_DIR = path.resolve('reports'),
    TEMPLATES_DIR = path.join(__dirname, 'template');

exports.learning = function(stats) {
    var login = stats.getLogin(),
        reportDir = path.join(REPORTS_DIR, 'learning', login),
        configs = getConfigsForCharts([{
            type: LineChart,
            data: stats.getSpeedStats(),
            opts: {options: {title: {text: 'Speed dependency'}}}
        }, {
            type: LineChart,
            data: stats.getAverageSpeedStats(),
            opts: {options: {title: {text: 'Average speed dependency'}}, datasetsOptions: {labels: ['average']}}
        }, {
            type: LineChart,
            data: stats.getRhythmogramStats(),
            opts: {options: {title: {text: 'Rhythmogram'}}}
        }, {
            type: LineChart,
            data: stats.getAverageRhythmogramStats(),
            opts: {options: {title: {text: 'Average rhythmogram'}}, datasetsOptions: {labels: ['average']}}
        }, {
            type: BarChart,
            data: stats.getBarStatsForRhythmogram(50),
            opts: {
                options: {title: {text: 'Frequency'}}
            }
        }, {
            type: BarChart,
            data: stats.getAverageBarStatsForRhythmogram(50),
            opts: {
                options: {title: {text: 'Average frequency'}},
                datasetsOptions: {labels: ['average']}
            }
        }]);

    return generate(login, reportDir, configs).thenResolve(stats);
};

exports.applying = function(stats) {
    var login = stats.getLogin(),
        reportDir = path.join(REPORTS_DIR, 'applying', login),
        configs = getConfigsForCharts([{
            type: LineChart,
            data: stats.getSpeedStats(),
            opts: {options: {title: {text: 'Speed dependency'}}, datasetsOptions: {labels: ['learning', 'applying']}}
        }, {
            type: LineChart,
            data: stats.getRhythmogramStats(),
            opts: {options: {title: {text: 'Rhythmogram'}}, datasetsOptions: {labels: ['learning', 'applying']}}
        }, {
            type: BarChart,
            data: stats.getFilteredBarStatsForRhythmogram(50),
            opts: {
                options: {title: {text: 'Filtered frequency bar chart for rhythmogram'}},
                datasetsOptions: {labels: ['learning', 'applying']}
            }
        }]);

    return generate(login, reportDir, configs).thenResolve(stats);
};

function generate(login, reportDir, configs) {
    return _(['index.html', 'index.js', 'index.css'])
        .map(readSource_)
        .thru(q.all)
        .value()
        .spread(templateSources_)
        .then(mkReportDir_)
        .then(saveReport_)
        .then(q.all);

    function readSource_(filename) {
        return qfs.read(path.join(TEMPLATES_DIR, filename));
    }

    function templateSources_(html, js, css) {
        return {
            html: _.template(html)({login: login, configs: configs}),
            js: _.template(js)({configs: JSON.stringify(configs)}),
            css: css
        };
    }

    function mkReportDir_(files) {
        return qfs.makeTree(reportDir).thenResolve(files)
    }

    function saveReport_(files) {
        return _.map(files, function(content, type) {
            return qfs.write(path.join(reportDir, 'index.' + type), content);
        });
    }
}

function getConfigsForCharts(charts) {
    return charts.map(function(chart) {
        return new chart.type(chart.data, chart.opts).getConfig();
    });
}
