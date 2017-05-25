(function (module) {
	var item = function() {
		return {
			restrict: 'A',
			templateUrl: 'app/common/item/template/itemTemplate.html'
		}
	};

	module.directive('ngItem', item);

}(angular.module('app')));