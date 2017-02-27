var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var port  = process.env.PORT || 8080;
var io = require('socket.io')(server);
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

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
		{"name":"Temperature","children":[]},
		{"name":"Visible Light","children":[]},
		{"name":"UV Light","children":[]},
		{"name":"Air Quality","children":[]}
		]});
	}
	var end;
	if(type == 0){
		end = "%";
	}else if(type == 1){
		end = "°F";
	}else if(type == 2){
		end = "Lumens";
	}else if(type == 3){
		end = "Lumens";
	}else if(type == 4){
		end = "Pollutants";
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
		 },
 		 {
 		 	"name":"Visible Light",
 		 	"children":[
 		 	{"name":req.body.visibility}
 		 	]
 		 },
 		 {
 		 	"name":"UV Light",
 		 	"children":[
 		 	{"name":req.body.uv}
 		 	]
 		 },
 		 {
 		 	"name":"Air Quality",
 		 	"children":[
 		 	{"name":req.body.airQuality}
 		 	]
  		 }
		 ]
		}
		]
	};
	data["id"] = req.body.id;
	data["Temperature"] = req.body.temp;
	data["Humidity"] = req.body.humidity;
	data["Visible Light"] = req.body.visibility;
	data["UV Light"] = req.body.uv;
	data["Air Quality"] = req.body.airQuality;
	dataSet.push(data);
	dataBank.push(data);
	addData(data["id"],data["Humidity"],0);
	addData(data["id"],data["Temperature"],1);
	addData(data["id"],data["Visible Light"],2);
	addData(data["id"],data["UV Light"],3);
	addData(data["id"],data["Air Quality"],4);
	
	res.sendStatus(200);
});

app.get('/nodes',function(req,res){
	var list = [];
	for(var key in file){
		list.push(key);
	}
	// for(var i = 0; i < dataBank.length; i++){
	// 	if(list.indexOf(dataBank[i].id) < 0	){
	// 		list.push(dataBank[i].id);
	// 	}
	// }
	res.end(list.toString());
});
app.get('/nodeTree',function(req,res){
	var list = [];
	var post = qs.parse(url.parse(req.url).query)
	res.end(JSON.stringify(file[post.id]));
	
	
});
//Serve the static front end
app.use(express.static('public'));

server.listen(port, () => {
	console.log("Server running on port " + port);
});


