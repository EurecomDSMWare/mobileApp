'use strict';
angular.module('MobileApp.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('TasksCtrl', function($scope, wunderlist, $stateParams) {
  if ( ! wunderlist.initApp() ) return;

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

  var checkDelta = (function () {
    var prevTasks = null;

    return function checkDelta(sync) {
      var changedTasks = [];
      var newTasks = [];

      if ( prevTasks === null ) {
        prevTasks = $scope.tasks;
      }

      angular.forEach($scope.tasks, function(task) {
        var prevTask = null;

        // If task has no id => it's a new task
        if ( !task.id ) {
          newTasks.push(task);
        }

        // Compare with existing task
        else {
          for ( var i = 0; i < prevTasks.length; i ++ ) {
            if ( prevTasks[i].id === task.id ) {
              prevTask = prevTasks[i];
              break;
            }
          }

          console.log(prevTask);

          if ( prevTask ) {
            var changed = false;
            var changedProperties = {};

            angular.forEach(task, function(value, key) {
              if ( prevTask[key] !== value ) {
                changedProperties[key] = value;
                changed = true;
              }
            });

            console.log('changed', changed);

            if ( changed ) {
              changedTasks.push(angular.extend(changedProperties, {id:task.id}));
            }
          }
        }
      });

      // TODO: fix the delta calculation
      console.log(newTasks, changedTasks);

      if ( newTasks.length > 0 || changedTasks.length > 0 ) {

        if ( sync ) {

          $scope.syncLoading = true;
          var newTasksAdded = 0;

          angular.forEach(newTasks, function(task) {
            wunderlist.addTask(task, function(returnedTask) {
              newTasksAdded ++;

              if ( newTasksAdded === newTasks.length ) {
                $scope.syncLoading = false;
              }
            });
          });
        }

        else {
          $scope.enableSync = true;
          return;
        }
      }

      $scope.enableSync = false;
    };
  })();

  $scope.sync = function() {
    checkDelta(true);
  };

  $scope.addTask = function(title) {
    $scope.tasks.unshift({
      title: title,
      list_id: $scope.list.id
    });

    checkDelta();
  };

  $scope.toggleTask = function(index) {
    if ( $scope.tasks[index].completed_at === null ) {
      $scope.tasks[index].completed_at = new Date();
    }
    else {
      $scope.tasks[index].completed_at = null;
    }

    checkDelta();
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
