(function (module) {

	var imageonload = function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.advert = {
					isPictLoaded: false
				};

				element.bind('load', function() {
					scope.advert.isPictLoaded = true;
				});
				element.bind('error', function() {
					scope.advert.isPictLoaded = false;
				});
			}
		}
	};

	module.directive('imageonload', imageonload);

}(angular.module('app')));