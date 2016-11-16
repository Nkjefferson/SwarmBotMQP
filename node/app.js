//var io = require('socket.io')(server);
var request = require('request');

var headers = {
	'User-Agent':       'Super Agent/0.0.1',
    	'Content-Type':     'application/json'
}

var requestData = {
	id: 0,
	humidity: 50,
	temp: 75
};

//configure the request
var options = {
	url: 'http://swarm.dyn.wpi.edu:8080/handle',
	method: 'POST',
	headers: headers,
	json: true,
	body: requestData
}

//Start the request
const interval = 5000;
setInterval(function() {
	//generate mock data
	requestData.humidity = Math.round(Math.random()*100);
	requestData.temp = Math.round((Math.random()*51) + 40);
	console.log(requestData.humidity);
	//send post request
	request(options, function(error, response, body){
		if(!error && response.statusCode == 200){
			console.log(body)
		}else{
			console.log(response.statusCode)
		}
	})
}, interval);
