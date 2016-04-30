var maths = require('../lib/maths');

describe('maths', function() {
    it('should get correlation coefficient', function() {
        maths.getCorrelationCoefficient([3, 5, 4, 4, 2, 3], [86, 95, 92, 83, 78, 82])
            .should.be.equal(0.8615550709823445);
    });

    it('should get the sum of absolute subtractions', function() {
        maths.getSumOfAbsoluteSubtractions([1, 2, 3], [3, 2, 1]).should.be.equal(4);
    });

    it('should get the sum of squared subtractions', function() {
        maths.getSumOfSquaredSubtractions([1, 2, 3], [3, 2, 1]).should.be.equal(8);
    });

    it('should get expected value', function() {
        maths.getExpectedValue([1, 3, 5, 7, 9, 11]).should.be.eql(6);
    });

    it('should get dispersion', function() {
        maths.getDispersion([1, 3, 5, 7, 9, 11]).should.be.eql(11.666666666666664);
    });

    it('should get standard deviation', function() {
        maths.getStandardDeviation([1, 3, 5, 7, 9, 11]).should.be.eql(3.415650255319866);
    });
});
