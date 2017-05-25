(function (module) {

	var pagination = function() {
		return {
			restrict: 'E',
			templateUrl: 'app/common/pagination/template/paginationTemplate.html',
			link: function(scope, element, attrs) {
				scope.activeItem = 0;

				scope.selectPage = function(index) {
					if (index < 0 || index >= scope.pageNumArray.length) return false;

					scope.choosePage(index);
				};
			}
		}
	};

	module.directive('pagination', pagination);

}(angular.module('app')));