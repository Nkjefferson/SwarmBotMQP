var express = require('express');
var app = express();
var server = require('http').Server(app);
var port  = process.env.PORT || 8080;
var io = require('socket.io')(server);

const sensorCount = 3;

io.on('connection', socket => {
	socket.emit('connected', generateDataSet(sensorCount));
});

const interval = 5000; // Fire off every 5 seconds, give or take
setInterval(() => {
	var dataSet = generateDataSet(sensorCount);
	io.sockets.emit('data', dataSet);
	console.log(dataSet);
}, interval);

app.use(express.static('public'));

server.listen(port, () => {
	console.log("Server running on port " + port);
});

// Generate a mock dataset
function generateDataSet(count) {
	var dataSet = [];
	for (i=0;i<count;i++) {
		dataSet.push(generateData(i));
	}

	return dataSet;
}

// Generate a mock datapoint, pass in ID number
function generateData(idNum) {
	var data = {},
	dataSet = [];

	// data["uid"] = Math.random().toString(36).substr(2,8);
	data["id"] = idNum;
	data["humidity"] = Math.round(Math.random()*100);
	data["temperature"] = Math.round((Math.random()*51) + 40);
	// data["timestamp"] = Date.now(); 

	return data;
}