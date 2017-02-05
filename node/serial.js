
var serialjs=require('serialport-js');

var requestData = {
	id: 0,
	humidity: 50,
	temp: 75
};

serialjs.open(
    '/dev/ttyUSB0',
    start,
    '\n'
);

function start(port){
    port.on(
        'data',
        gotData
    );

requestData.humidity = Math.round(Math.random()*100);
requestData.temp = Math.round((Math.random()*51) + 40);
    port.send(JSON.stringify(requestData));
    port.close();
}

function gotData(data){
    console.log(data);
}
