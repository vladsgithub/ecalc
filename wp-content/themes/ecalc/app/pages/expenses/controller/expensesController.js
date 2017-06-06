(function (module) {

	function addEvent() {
		document.querySelectorAll('[data-test]')[0].addEventListener('click', function() {
			alert(1);
		});
	}

	var expensesCtrl = ['$scope',
		function ($scope) {

			if (localStorage.getItem('items')) {
				$scope.items = JSON.parse(localStorage.getItem('items')).arr;
			} else {
				$scope.items = [ {n: 0}, {n: 1}, {n: 2} ];
			}

			addEvent();

			$scope.addItem = function () {
				$scope.items.push( {n: $scope.items.length} );
			};

			$scope.deleteLastItem = function () {
				$scope.items.pop();
			};

			$scope.updateLocalStorage = function(newValue, oldValue) {
				if (newValue !== undefined) {
					var obj = JSON.stringify( { arr: newValue } );
	console.log('obj=',obj);
					localStorage.setItem('items', obj);
				}
			}

			$scope.$watch('items', $scope.updateLocalStorage, true);

		}];

	module.controller('expensesCtrl', expensesCtrl);

}(angular.module("app")));