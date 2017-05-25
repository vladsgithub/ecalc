(function(module) {
	var listService = ['$resource', function($resource) {
		var Adverts = $resource('/advertisements');

		return {
			queryAdverts: function() {
				return Adverts.query().$promise;
			}
		};
	}];

	module.factory("listService", listService);

}(angular.module("app")));