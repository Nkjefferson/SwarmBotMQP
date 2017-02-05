
var serialjs=require('serialport-js');

var requestData = {
	id: 0,
	humidity: 50,
	temp: 75
};

serialjs.open(
    '/dev/ttyUSB1',
    start,
    '\n'
);

function start(port){
    port.on(
        'data',
        gotData
    );

}

function gotData(data){
    console.log(data);
}
