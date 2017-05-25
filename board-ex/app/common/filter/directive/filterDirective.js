(function (module) {

	var filter = function() {
		return {
			restrict: 'E',
			templateUrl: 'app/common/filter/template/filterTemplate.html',
			link: function(scope, element, attrs) {
				scope.choosePage();
			}
		}
	};

	module.directive('filter', filter);

}(angular.module('app')));