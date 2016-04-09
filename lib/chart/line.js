var inherit = require('inherit'),

    Chart = require('./');

/**
 *
 */
module.exports = inherit(Chart, {
    _type: 'line',

    _options: {elements: {point: {radius: 1}}},

    _datasetsOptions: {fill: false, borderDash: [0, 0]}
});
