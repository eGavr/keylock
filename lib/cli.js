var coa = require('coa'),

    keylock = require('./');

module.exports = coa.Cmd()
    .name(process.argv[1])
    .title('Keylock')
    .helpful()
        .opt()
        .name('mode').title('learning or applying')
        .long('mode').short('m')
        .end()
    .opt()
        .name('login').title('login')
        .long('login').short('l')
        .end()
    .opt()
        .name('force').title('do not ask about a login existance')
        .long('force').short('f')
        .flag()
        .end()
    .opt()
        .name('debug').title('debug mode')
        .long('debug').short('d')
        .flag()
        .end()
    .opt()
        .name('criterias')
        .title('classification criterias (sumOfAbsoluteSubtractions, sumOfSquaredSubtractions, correlationCoefficient)')
        .long('criteria').short('c')
        .def('correlationCoefficient')
        .arr()
        .end()
    .act(function(opts) {
        return keylock(opts).thenResolve();
    })
    .run();
