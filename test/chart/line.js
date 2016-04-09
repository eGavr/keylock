var LineChart = require('../../lib/chart/line');

describe('chart:line', function() {
    it('should configure a line chart', function() {
        new LineChart({
            login: 'login',
            labels: ['a', 'b', 'c', 'd'],
            data: [[1, 2, 3, 4], [5, 6, 7, 8]]
        }).getConfig().should.be.eql({
            type: 'line',
            data: {
                labels: ['a', 'b', 'c', 'd'],
                datasets: [{
                    label: '1st learning',
                    data: [1, 2, 3, 4],
                    fill: false,
                    borderDash: [0, 0]
                }, {
                    label: '2nd learning',
                    data: [5, 6, 7, 8],
                    fill: false,
                    borderDash: [0, 0]
                }]
            },
            options: {
                legend: {position: 'bottom'},
                title: {display: true, text: 'login'},
                elements: {point: {radius: 1}}
            }
        });
    });
});
