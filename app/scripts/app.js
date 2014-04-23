'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var myApp = angular.module('MobileApp', ['ionic', 'MobileApp.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.login', {
      url: '/login',
      views: {
        'menuContent' :{
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent' :{
          templateUrl: 'templates/search.html'
        }
      }
    })

    .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent' :{
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.tasks', {
      url: '/tasks/:id',
      views: {
        'menuContent' :{
          templateUrl: 'templates/tasks.html',
          controller: 'TasksCtrl'
        }
      }
    })

    .state('app.single', {
      url: '/playlists/:playlistId',
      views: {
        'menuContent' :{
          templateUrl: 'templates/playlist.html',
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});

myApp.factory('wunderlist', function ($http, $location) {
  var apiUrl = 'https://api.wunderlist.com';

  var authToken = null;

  var wunderlist = {

    initApp: function initApp() {
      if ( !this.isSignedIn() ) {
        $location.path('/app/login');
        return false;
      }
      return true;
    },

    isSignedIn: function isSignedIn() {
      return authToken !== null;
    },

    authHttp: function(options) {
      var withAuth = angular.extend({
        headers: {
          Authorization: 'Bearer ' + this.getAuthToken()
        }
      }, options);
      return $http(withAuth);
    },

    getAuthToken: function getAuthToken() {
      return authToken;
    },

    getTasks: function getTasks(listId, callback) {
      this.authHttp({
        url: apiUrl + '/me/tasks',
        method: 'GET'
      })
      .success(function(allTasks) {
        var tasks = [];

        // Return only tasks for that matches this wanted task list
        angular.forEach(allTasks, function(task) {
          if ( task.list_id === listId ) {
            tasks.push(task);
          }
        });

        callback(null, tasks);
      })
      .error(function(error) {
        callback(error);
      })
    },

    login: function login(email, password, callback) {

      $http({
        url: apiUrl + '/login',
        data: {
          email: email,
          password: password
        },
        method: 'POST'
      })
      .success(function(data) {
        // Save login response
        window.localStorage.setItem('user', JSON.stringify(data));
        authToken = data.token;
        callback(null, true);
      })
      .error(function(data) {
        callback(data);
      });
    }

  };

  return wunderlist;
});
