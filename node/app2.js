var request = require('request');
var sensors = require('../../bonescript-test/testSunlight.js');

var sensorInstance = new sensors();

var headers = {
	'User-Agent':       'Super Agent/0.0.1',
	'Content-Type':     'application/json'
}

var requestData = {
	id: 1
};

//configure the request
var options = {
	url: 'http://swarm.dyn.wpi.edu:8080/handle',

	// url: 'http://localhost:8080/handle',
	method: 'POST',
	headers: headers,
	json: true,
	body: requestData
}

//Start the request
var sendData = function() {
	//generate mock data
	sensorInstance.getData(function(data) {
		options.body = data;
		request(options, function(error, response, body){
			if(!error && response.statusCode == 200){
				console.log(body)
			}else{
				console.log(response);
				// console.log(response.statusCode)
			}
		})
	})

	//send post request
	
};

sendData();
