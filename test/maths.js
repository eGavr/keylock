var maths = require('../lib/maths');

describe('maths', function() {
    it('should get correlation coefficient', function() {
        maths.getCorrelationCoefficient([[3, 5, 4, 4, 2, 3], [86, 95, 92, 83, 78, 82]])
            .should.be.equal(0.8615550709823445);
    });
});
