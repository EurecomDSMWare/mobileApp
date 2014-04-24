/*jshint camelcase: false */
'use strict';
angular.module('MobileApp.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('TasksCtrl', function($scope, wunderlist, $stateParams) {
  if ( ! wunderlist.initApp() ) {
    return;
  }

  $scope.loading = true;

  if ( $stateParams.id === 'inbox' ) {
    $scope.list = {
      id: $stateParams.id,
      title: 'Inbox'
    };
  }
  else {
    // TODO
  }

  wunderlist.getTasks($scope.list.id, function(error, tasks) {
    $scope.loading = false;
    $scope.tasks = tasks;
  });

  $scope.addTask = function(title) {
    $scope.syncLoading = true;

    var task = {
      title: title,
      list_id: $scope.list.id
    };

    $scope.tasks.unshift(task);

    wunderlist.addTask(task, function(returnedTask) {
      $scope.syncLoading = false;
    });
  };

  $scope.toggleTask = function(index) {
    $scope.syncLoading = true;

    if ( $scope.tasks[index].completed_at === null ) {
      $scope.tasks[index].completed_at = new Date();
      wunderlist.setTaskDone($scope.tasks[index], function(error, task) {
        // TODO: error handling
        $scope.syncLoading = false;
        $scope.tasks[index] = task;
      });
    }

    else {
      $scope.tasks[index].completed_at = null;
      wunderlist.setTaskNotDone($scope.tasks[index], function(error, task) {
        // TODO: error handling
        $scope.syncLoading = false;
        $scope.tasks[index] = task;
      });
    }
  };
})

.controller('LoginCtrl', function($scope, wunderlist, $location) {

  $scope.login = function(email, password) {

    $scope.loading = true;

    wunderlist.login(email, password, function (error, success) {

      $scope.loading = false;

      if ( error ) {
        $scope.loginError = true;
      }

      else {
        $location.path('/app/tasks/inbox');
      }

    });
  };

});
