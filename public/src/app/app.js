angular.module( 'ngConnect', [
  'templates-app',
  'templates-common',
  'ngConnect.home',
  'ngConnect.about',
  'services.sipMngr',
  'services.webSocketMngr',
  'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Connect' ;
    }
  });
})

;

