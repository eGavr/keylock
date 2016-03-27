var configs = <%= configs %>;

$.each(configs, function(i, config) {
    $.each(config.data.datasets, function(j , dataset) {
        var background = randomColor(0.5);
        dataset.borderColor = background;
        dataset.backgroundColor = background;
        dataset.pointBorderColor = background;
        dataset.pointBackgroundColor = background;
        dataset.pointBorderWidth = 1;
    });
})

window.onload = function() {
    $.each(configs, function(i, config) {
        window.myLine = new Chart(document.getElementById("canvas" + i), config)
    });

    updateLegend();
};

function updateLegend() {
    $legendContainer = $('#legendContainer');
    $legendContainer.empty();
    $legendContainer.append(window.myLine.generateLegend());
}

function randomColorFactor() {
    return Math.round(Math.random() * 255);
}

function randomColor(opacity) {
    return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
}
