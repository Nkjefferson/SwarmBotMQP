var heatmap = require('heatmap');

var heat = heatmap(500, 500, { radius : 30 });
for (var i = 0; i < 5; i++) {
    var rho = Math.random() * 2 * Math.PI;
    var z = Math.pow(Math.random(), 2) * 200;

    var x = 150 + Math.cos(rho);
    var y = 300 + Math.sin(rho);

    heat.addPoint(x, y, {weight:1});
}


heat.draw();

var fs = require('fs');
fs.writeFileSync('blob.png', heat.canvas.toBuffer());