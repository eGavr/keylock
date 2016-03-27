var LineChart = require('../../lib/chart/bar');

describe('chart:bar', function() {
    it('should configure a bar chart', function() {
        new LineChart({
            login: 'login',
            labels: ['a', 'b', 'c', 'd'],
            data: [[1, 2, 3, 4], [5, 6, 7, 8]]
        }).getConfig().should.be.eql({
            type: 'bar',
            data: {
                labels: ['a', 'b', 'c', 'd'],
                datasets: [{
                    label: '1st learning',
                    data: [1, 2, 3, 4]
                }, {
                    label: '2nd learning',
                    data: [5, 6, 7, 8]
                }]
            },
            options: {
                legend: {position: 'bottom'},
                title: {display: true, text: 'login'}
            }
        });
    });
});
