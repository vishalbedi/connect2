angular.module('services.webSocketMngr', []).factory('webSocketMngr', ['$rootScope','$window', function($rootScope,$window) {
var scopeApply = function(fn) {
      if ($rootScope.$$phase) {
        return fn();
      } else {
        return $rootScope.$apply(fn);
      }
    };
  var webSocketMngr = {};
  var roomId;
  // Connect to the signaling server
  var socket = io();

  socket.on('ipaddr', function (ipaddr) {
    console.log('Server IP address is: ' + ipaddr);
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.ipaddr', ipaddr);
    });
  });

  socket.on('created', function (room, clientId) {
    console.log('Created room', room, '- my client ID is', clientId);
    roomId = room;
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.roomcreated', {room:room,clientId:clientId});
    });
  });

  socket.on('joined', function (room, clientId) {
    roomId = room;
    console.log('This peer has joined room', room, 'with client ID', clientId);
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.roomjoined', {room:room,clientId:clientId});
    });
  });

  socket.on('full', function (room) {
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.roomfull', {room:room});
    });
  });

  socket.on('ready', function () {
    //Some one joined the room lets start peer connection
    console.log("System Ready... ");
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.ready');
    });
  });

  socket.on('log', function (array) {
    console.log.apply(console, array);
  });

  socket.on('message', function (message){
    console.log('Client received message:', message);
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.message',message);
    });
  });

  socket.on('coneected', function(socketId){
    scopeApply(function(){
      $rootScope.$broadcast('services.webSocketMngr.coneected', socketId);
    });
  });

  var joinRoom= function(room){
    roomId = room;
    socket.emit('join', room);
  };

  function sendMessage(message){
    var wrappedMsg = {
      roomId : roomId,
      message:message
    };
    socket.emit('message', wrappedMsg);
  }

  webSocketMngr.sendMessage = sendMessage;
  webSocketMngr.joinRoom = joinRoom;

  return webSocketMngr;

}]);