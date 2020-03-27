var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const axios = require('axios').default;

var users =[];
var onlineuser =[];
var url = 'http://localhost/elate/public/api/v1';

app.get("/", function(req,res) {
	res.sendFile(__dirname+"/index.html");

});
io.sockets.on("connection", function(socket) {
	users.push(socket);
	console.log("New user connected "+users.length),

	socket.on("disconnect", function() {
		users.splice(users.indexOf(socket),1);
		onlineuser.splice(onlineuser.indexOf(socket.username),1);
		console.log("User disconnected "+users.length);
	});

	socket.on("new user", function(data) {
		socket.username = data;
		users[socket.username] = socket;
		// onlineuser.push(socket.username);
		console.log("user connected " + socket.username);
		updateuser();
	});	


	function updateuser() {
		io.sockets.emit("get user", onlineuser);
	}

	socket.on("send message", function(from, to, msg) {
		saveData(from, to, msg);
		if (to in users) {
			users[to].emit("rceive message", {to:to, msg:msg, from:from})
		}
		if (from in users) {
			users[from].emit("rceive message", {to:to, msg:msg, from:from})
		}
		
		console.log('send message');
		// io.sockets.emit("rceive message",{name:name, msg:msg});
	});

});

function saveData(from, to, msg)
{
	const options = {
		headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
	};
	axios.get(url + '/redis', options)
	.then(function (response) {
		// handle success
		console.log(response);
	})
	.catch(function (error) {
		// handle error
		console.log(error);
	})
	.finally(function () {
		// always executed
		console.log('finally')
	});
}

http.listen(process.env.PORT || 3000, function() {
	console.log("Server Created with port 1234");
});