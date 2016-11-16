var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var port  = process.env.PORT || 8080;
var io = require('socket.io')(server);

var dataSet = [];



io.on('connection', socket => {
	socket.emit('connected', dataSet);
	console.log('user connected');
});

const interval = 5000; // Fire off every 5 seconds, give or take
setInterval(() => {
	if(dataSet.length > 0){
		io.sockets.emit('data', dataSet);
		console.log(dataSet);
		dataSet.shift();
	}
}, interval);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
//parse incomming post requests to the server from sensors
app.post('/handle',function(req, res){
	var data = {}
	data["id"] = req.body.id;
	data["temperature"] = req.body.temp;
	data["humidity"] = req.body.humidity;
	console.log(data["id"] + " Posted Data " + data["humidity"] + " Humidity");
	dataSet.push(data);
	res.sendStatus(200);
});
//Serve the static front end
app.use(express.static('public'));

server.listen(port, () => {
	console.log("Server running on port " + port);
});


