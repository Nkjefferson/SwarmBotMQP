var request = require('request');
var Sensors = require('./lib/sensors.js');

var sensorInstance = new Sensors();

var headers = {
	'User-Agent':       'Super Agent/0.0.1',
    	'Content-Type':     'application/json'
}
//configure the request
var options = {
	url: 'http://swarm.dyn.wpi.edu:8080/handle',
	// url: 'http://localhost:8080/handle', // For local testing
	method: 'POST',
	headers: {
		'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json'
	},
	json: true,
}

//Start the request
var sendData = function() {
	sensorInstance.getData(function(data) {
		options.body = data;
		request(options, function(error, response, body){
			if(!error && response.statusCode == 200){
				console.log(body)
			}else{
				console.log(response.statusCode)
			}
		})
	})
};

sendData();