/*jshint camelcase: false, devel:true */
'use strict';
angular.module('MobileApp.controllers', [])

.controller('AppCtrl', function($scope, wunderlist) {

  $scope.data = {};

  $scope.$on('updateLists', function() {
    wunderlist.getLists(function(error, lists) {
      $scope.lists = lists;
    });
  });

  $scope.addList = function() {
    var newList = {
      title: $scope.data.newListTitle
    };

    $scope.loading = true;

    wunderlist.addList(newList, function(error, list) {
      $scope.loading = false;
      if ( error ) {
        alert('An error occurred when creating new list');
      }
      else {
        $scope.lists.push(list);
      }
    });

    $scope.data.newListTitle = '';
  };

})

.controller('TasksCtrl', function($scope, wunderlist, $stateParams, $location) {

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
  else if ( $stateParams.id === 'starred' ) {
    $scope.starredView = true;
    $scope.list = {
      id: $stateParams.id,
      title: 'Starred'
    };
  }
  else {
    $scope.canDeleteList = true;
    $scope.list = {
      id: $stateParams.id,
      title: wunderlist.getListFromId($stateParams.id).title
    };
  }

  wunderlist.getTasks($scope.list.id, function(error, tasks) {
    $scope.loading = false;
    $scope.tasks = tasks;
  });

  $scope.setStarred = function(task) {
    task.starred = true;

    $scope.syncLoading = true;

    wunderlist.setTaskStarredStatus(task, true, function(error) {
      $scope.syncLoading = false;

      if ( error ) {
        alert('An error occurred when trying to star task');
        task.starred = false;
      }
    });
  };

  $scope.setNotStarred = function(task) {
    task.starred = false;

    // If we are in Starred-view, remove task when unstarred
    if ( $scope.list.id === 'starred' ) {
      $scope.removeTaskFromList(task);
    }

    $scope.syncLoading = true;

    wunderlist.setTaskStarredStatus(task, false, function(error) {
      $scope.syncLoading = false;

      if ( error ) {
        alert('An error occurred when trying to unstar task');
        task.starred = true;
      }
    });
  };

  $scope.removeList = function() {
    if ( confirm('The list and its tasks will be deleted. Do you want to continue?') ) {
      $scope.loading = true;
      wunderlist.removeList($scope.list, function(error) {
        $scope.loading = false;
        if ( error ) {
          alert('An error occurred removing the list');
        }
        else {
          $scope.$emit('updateLists');
          $location.path('/app/tasks/inbox');
        }
      });
    }
  };

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
    angular.forEach($scope.tasks, function(task) {
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

    wunderlist.login(email, password, function (error) {

      $scope.loading = false;

      if ( error ) {
        $scope.loginError = true;
      }

      else {
        $scope.$emit('updateLists');
        $location.path('/app/tasks/inbox');
      }

    });
  };

});
