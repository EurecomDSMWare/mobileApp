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

  $scope.hasCompletedTasks = function() {

    // Exit if tasks are not yet loaded
    if ( !$scope.tasks ) {
      return false;
    }

    for ( var i = 0; i < $scope.tasks.length; i ++ ) {
      if ( $scope.tasks[i].completed_at !== null ) {
        return true;
      }
    }

    return false;
  };

  $scope.removeTaskFromList = function(targetTask) {
    angular.forEach($scope.tasks, function(task, index) {
      if ( task.id === targetTask.id ) {
        $scope.tasks.splice(index, 1);
      }
    });
  };

  $scope.clearCompleted = function() {
    angular.forEach($scope.tasks, function(task, index) {
      if ( task.completed_at !== null ) {
        wunderlist.removeTask(task, function(error) {
          if ( error ) {
            alert('An error occurred when clearing the task(s)');
          }
          else {
            $scope.removeTaskFromList(task);
          }
        });
      }
    });
  };

  $scope.addTask = function(title) {
    $scope.syncLoading = true;

    var task = {
      title: title,
      list_id: $scope.list.id
    };

    wunderlist.addTask(task, function(error, returnedTask) {
      $scope.syncLoading = false;
      if ( error ) {
        alert('An error occurred when adding task');
      }
      else {
        $scope.tasks.unshift(returnedTask);
      }
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
