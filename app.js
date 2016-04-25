var express = require('express');
var PORT = process.env.PORT || 5000;
var io = require('socket.io');
var http = require('http');
var ConnectAPI = module.exports =  function(){

}

ConnectAPI.prototype.init = function(){
  var self = this;
  var app = express();
  
  //parsing request objects
  var bodyParser = require('body-parser');
  app.use(express.static(__dirname + "/public/",{index:'index.html'}));
  app.use(bodyParser.json());
  var server = http.createServer(app);  
  var webSocket = io.listen(server);
  app.set('socket',webSocket);
  //set app as a member of ConnectAPI class
  self.app = app;
  //set-up routes
  require('./lib/routes/index')(self.app)
  //start the server
  server.listen(PORT, function  (argument) {
    console.log("App Server Started at port Number: " + PORT);
  });
}