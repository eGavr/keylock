var coa = require('coa'),

    keylock = require('./');

///
module.exports = coa.Cmd()
    .name(process.argv[1])
    .title('Keylock – some kind of neural network')
    .helpful()
        .opt()
        .name('mode').title('Learning of Applying')
        .long('mode').short('m')
        .end()
    .opt()
        .name('login').title('Login')
        .long('login').short('l')
        .end()
    .opt()
        .name('force').title('Do not ask about a login existance')
        .long('force').short('f')
        .flag()
        .end()
    .act(function(opts) {
        return keylock(opts).thenResolve();
    })
    .run();
