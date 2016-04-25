'use strict';
var os = require('os');
module.exports = function(app){
	var io = app.get('socket');
	var log = console.log;
	io.sockets.on('connection',connectionCallback);

	function connectionCallback(socket) {
		console.log('Connected');
		socket.emit('connected', socket.id);
		socket.on('message', bradcastToRoom);
		socket.on('join', tryJoiningRoom);
		socket.on('ipaddr', getIPAddress);


	function bradcastToRoom(message){
		var roomId = message.roomId;
		var _room = io.sockets.adapter.rooms[roomId];
		console.log(_room);
		socket.broadcast.to(roomId).emit('message', message.message)
	}
	function tryJoiningRoom(room){
    	log('Trying to join room... ' + room);
    	var _room = io.sockets.adapter.rooms[room];
		var clientNumber = 0;
		if(_room != undefined)
			clientNumber = _room.length;
		if (clientNumber === 0){
			createRoom(room);
		} else if (clientNumber === 1) {
			joinRoom(room);
		} else if(clientNumber > 2){ // max three clients
			socket.emit('full', room);
		}
    }
    function createRoom(room){
    	socket.join(room);
		socket.emit('created', room, socket.id);
		log("Room Created")
    }

    function joinRoom(room){
    	socket.join(room);
        socket.emit('joined', room, socket.id);
        log("room Joined");
        io.sockets.in(room).emit('ready');
    }


    function getIPAddress () {
		var ifaces = os.networkInterfaces();
		Object.keys(ifaces).forEach(function (ifname) {
		  var alias = 0;
		  ifaces[ifname].forEach(function (iface) {
		    if ('IPv4' !== iface.family || iface.internal !== false) {
		      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		      return;
		    }
		    if (alias >= 1) {
		      // this single interface has multiple ipv4 addresses
		      console.log(ifname + ':' + alias, iface.address);
		    } else {
		      // this interface has only one ipv4 adress
		      console.log(ifname, iface.address);
		      socket.emit('ipaddr', iface.address);
		    }
		    ++alias;
		  });
		});

    }
	}


}