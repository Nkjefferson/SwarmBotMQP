var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var port  = process.env.PORT || 8080;
var io = require('socket.io')(server);
var fs = require('fs');

var dataSet = [];
var dataBank = [];

var fileName = './public/nodes.json';
var file = require(fileName);

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var addData = function(id,data,type){
	var d = new Date();
	var n = d.getDate();
	var month = monthNames[d.getMonth()];

	if(!file[id]){
		file[id]={"name":id , "children":[]}
	}
	var mon = false;
	var monIndex = 0;
	file[id].children.forEach(function(item){
		if(item.name == month){
			mon = true;
		}else if(mon == false){
			monIndex++;
		}
	})
	if(mon == false){
		file[id].children.push({"name":month,"children":[]})
		//monIndex = file[id].children.length
	}
	var day = false;
	var dayIndex = 0;
	file[id].children[monIndex].children.forEach(function(item){
		if(item.name == n.toString()){
			day = true;
		}else if(day==false){
			dayIndex++;
		}
	})
	if(day == false){
		file[id].children[monIndex].children.push({"name":n.toString(),"children":[
		{"name":"Humidity","children":[]},
		{"name":"Temperature","children":[]}
		]});
	}
	var end;
	if(type == 0){
		end = "%";
	}else if(type == 1){
		end = "°F";
	}
	file[id].children[monIndex].children[dayIndex].children[type].children.push({"name":d.toLocaleTimeString()+ ": " + data.toString() + end});


	fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err) {
	  if (err) return console.log(err);
	  //console.log(JSON.stringify(file));
	 // console.log('writing to ' + fileName);
	});
}



io.on('connection', socket => {
	socket.emit('connected', dataSet);
	console.log('user connected');
});

const interval = 5000; // Fire off every 5 seconds, give or take
setInterval(() => {
	if(dataSet.length > 0){
		io.sockets.emit('data', dataSet);
		//console.log(dataSet);
		dataSet.shift();
	}
}, interval);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
//parse incomming post requests to the server from sensors
app.post('/handle',function(req, res){
	var d = new Date();
	var n = d.getDate();
	var data = {};
	var dat = {
		"name": monthNames[d.getMonth().toString()], 
		"children": [
		{"name":n.toString(),
		 "children":[
		 {
		 	"name":"Humidity",
		 	"children":[
		 	{"name":req.body.humidity}
		 	]
		 },
		 {
		 	"name":"Temperature",
		 	"children":[
		 	{"name":req.body.temp}
		 	]
		 }
		 ]
		}
		]
	};
	data["id"] = req.body.id;
	data["temperature"] = req.body.temp;
	data["humidity"] = req.body.humidity;
	//console.log(data["id"] + " Posted Data " + data["humidity"] + " Humidity");
	dataSet.push(data);
	dataBank.push(data);
	addData(data["id"],data["humidity"],0);
	addData(data["id"],data["temperature"],1);

	//console.log(data["id"]);
	//console.log(file["1"]);
	//file[data["id"]]= dat;



	
	res.sendStatus(200);
});

app.get('/nodes',function(req,res){
	var list = [];
	for(var i = 0; i < dataBank.length; i++){
		if(list.indexOf(dataBank[i].id) < 0	){
			list.push(dataBank[i].id);
		}
	}
	res.end(list.toString());
});
app.get('/nodeTree',function(req,res){
	var list = [];
	console.log(JSON.stringify(file["0"]));
	res.end(JSON.stringify(file[0]));
	console.log("sent");
});
//Serve the static front end
app.use(express.static('public'));

server.listen(port, () => {
	console.log("Server running on port " + port);
});


