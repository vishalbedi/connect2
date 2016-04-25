angular.module( 'ngConnect.home', [
  'ui.router',
  'plusOne'
])


.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'HomeCtrl', ['$scope','$window', 'sipMngr','webSocketMngr', function HomeController( $scope , $window, sipMngr, webSocketMngr) {
  var localVideo = document.getElementById('local-video');
  var remoteVideo = document.getElementById('remote-video');
  var miniVideo = document.getElementById('mini-video');
  $scope.model = {
    roomSelected :false
  };
  $scope.model.isRemoteStreamReady = false;
  $scope.model.roomId = getRandomToken();
  $scope.join = function(){
    var roomId = $scope.model.roomId;
    if(roomId.length < 1){
      roomId = $scope.model.roomId = getRandomToken();
    }
    $scope.model.roomSelected = true;
    sipMngr.getVideoStream();
  
  };

  $scope.model.isCallOriginator = false;

  $scope.$on('services.sipMngr.userMedia', function (err, stream) {
    $scope.model.localStream = stream;
    miniVideo.src = $window.URL.createObjectURL(stream);
    webSocketMngr.joinRoom($scope.model.roomId);
  });

  $scope.$on('services.webSocketMngr.roomcreated', function(err, args){
    $scope.model.isCallOriginator = true;
  });

  $scope.$on('services.webSocketMngr.roomjoined', function(err, args){
    $scope.model.isCallOriginator = false;
  });

  $scope.$on('services.webSocketMngr.ready', function(){
    sipMngr.createPeerConnection($scope.model.isCallOriginator, sipMngr.CONFIG );
  });

  $scope.$on('services.webSocketMngr.message', function(err, message){
    sipMngr.handleSignallingMessage(message);
  });

  $scope.$on('services.sipMngr.remoteStream', function(err, remoteStream){
    $scope.model.isRemoteStreamReady = true;
    remoteVideo.src = $window.URL.createObjectURL(remoteStream);
    $scope.model.remoteStream = remoteStream;
  });

  function getRandomToken() {
    return Math.floor((1 + Math.random()) * Math.pow(10,6)).toString(16).substring(1);
  }

}]);

