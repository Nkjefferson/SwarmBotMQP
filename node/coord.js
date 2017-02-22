var SerialPort = require('serialport');
var request = require('request');
var port = new SerialPort('/dev/ttyUSB0',{
	parser: SerialPort.parsers.readline('\n')}
	);
 
port.on('open', function() {
  port.write('', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});
 
// open errors will be emitted as an error event 
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

port.on('data', function(dat){	
  console.log(dat);
  //if(dat.includes('{')){
    sendData(dat);
  //}
});


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

  	//url: 'http://localhost:8080/handle',
	method: 'POST',
	headers: headers,
	json: true,
	body: requestData
}

//Start the request
const interval = 5000;

var sendData = function(data) {
	//generate data from json
	var newData = JSON.parse(data);
	requestData.id = newData.id;
	requestData.humidity = newData.humidity;
	requestData.temp = newData.temp;
	console.log(requestData);
	//send post request
	request(options, function(error, response, body){
		if(!error && response.statusCode == 200){
			console.log(body)
		}else{
			console.log(response.statusCode)
		}
	})
};
