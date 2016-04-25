angular.module('services.sipMngr', []).factory('sipMngr', ['$rootScope','$window','webSocketMngr', function($rootScope,$window,webSocketMngr) {
  var scopeApply = function(fn) {
      if ($rootScope.$$phase) {
        return fn();
      } else {
        return $rootScope.$apply(fn);
      }
    };
  var sipmlMngrService = {},
   //Config variables for STUN and TURN servers
   config = { 'iceServers': [
      {
        'url': 'stun:stun.l.google.com:19302'
      },
      {
        'url': 'turn:192.158.29.39:3478?transport=udp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      },
      {
        'url': 'turn:192.158.29.39:3478?transport=tcp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      }
    ]},
   sdpConfig = {'mandatory': {
    'OfferToReceiveAudio':true,
    'OfferToReceiveVideo':true }},
   constraints = {video: true},
   peerConn,
   localStream;
  sipmlMngrService.CONFIG = config;
  var getVideoStream = function(){
    getUserMedia(constraints, successCallback, errorCallback);
  };
  function successCallback(stream) {
    localStream = stream;
    scopeApply(function(){
      $rootScope.$broadcast('services.sipMngr.userMedia', stream);
    });
  }
 
  function errorCallback(error){
    console.log("getUserMedia error: ", error);
  }
  sipmlMngrService.getVideoStream = getVideoStream;

  function createPeerConn(isInitiator, config) {
    console.log("isInitiator  " + isInitiator);
      peerConn = new RTCPeerConnection(config);
      // send any ice candidates to the other peer
      peerConn.addStream(localStream);
      peerConn.onicecandidate = function (event) {
          console.log('onIceCandidate event:', event);
          if (event.candidate) {
              webSocketMngr.sendMessage({
                  type: 'candidate',
                  label: event.candidate.sdpMLineIndex,
                  id: event.candidate.sdpMid,
                  candidate: event.candidate.candidate
              });
          } else {
              console.log('End of candidates.');
          }
      };

      if (isInitiator) {
          console.log('Creating an offer');
          peerConn.createOffer(onLocalSessionCreated, logError);
      }
      // remote stream 
      peerConn.onaddstream = function(event){
        $rootScope.$broadcast('services.sipMngr.remoteStream', event.stream);
      };
  }

  function onLocalSessionCreated(desc) {
    console.log('local session created:', desc);
    peerConn.setLocalDescription(desc, function () {
        console.log('sending local desc:', peerConn.localDescription);
        webSocketMngr.sendMessage(peerConn.localDescription);
    }, logError);
  }
  
  function handleMessaging(message) {
    if (message.type === 'offer') {
      console.log('got offer...');
      peerConn.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);
      peerConn.createAnswer(onLocalSessionCreated, logError, sdpConfig);

    } else if (message.type === 'answer') {
      console.log('Got answer.');
      peerConn.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);
    } else if (message.type === 'candidate') {
      peerConn.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));
      console.log('got candidates');
    } else if (message === 'bye') {
      // TODO: cleanup RTC connection?
    }
  }
  function logError(err){
    console.error(err);
  }
  sipmlMngrService.handleSignallingMessage = handleMessaging;
  sipmlMngrService.createPeerConnection = createPeerConn;
  return sipmlMngrService;
}]);