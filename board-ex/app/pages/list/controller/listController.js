(function (module) {

	var listCtrl = ['$rootScope', '$scope', '$http', 'listService', 'advertService',
		function ($rootScope, $scope, $http, listService, advertService) {
			$scope.resultQty = [5, 10, 50, 100];
			$scope.qtyOnPage = $scope.resultQty[0];

			$scope.choosePage = function (pageNumber) {
				pageNumber = pageNumber || 0;
				$scope.activeItem = pageNumber;
				$scope.startNum = $scope.qtyOnPage * pageNumber;
				$scope.endNum = $scope.qtyOnPage * (1 + pageNumber);
			};

			$scope.updatePagination = function (newValue) {
				if (newValue !== undefined) {
					$scope.pageNumArray = [];
					var arrLength = Math.ceil(newValue.length / $scope.qtyOnPage);
					for (var i = 0; i < arrLength; i++) {
						$scope.pageNumArray.push(i * $scope.qtyOnPage);
					}
				}
			};

			$scope.getAdverts = function () {
				listService.queryAdverts().then(function (response) {
					$scope.adverts = response;
					$scope.choosePage();
					$scope.updatePagination($scope.results);
				});
			};

			$scope.deleteItem = function (index) {
				var question = confirm("Do you want to delete this advert? Are you sure?");

				if (question) {
					advertService.deleteAdvert(index).then(function (response) {
						$scope.getAdverts();
					});
				}
			};

			$scope.$watch('results', $scope.updatePagination);
		}];

	module.controller('listCtrl', listCtrl);

}(angular.module("app")));