(function(module) {
	var advertService = ['$resource', function($resource) {
		var Adverts = $resource('/advertisements/:id', {
			id: "@id"
		}, {
			update: {
				method: 'PUT'
			}
		});

		return {
			queryAdverts: function() {
				return Adverts.query().$promise;
			},
			getAdvert: function(num) {
				return Adverts.get({id: num}).$promise;
			},
			updateAdvert: function(item) {
				return Adverts.update({id: item.id}, item).$promise;
			},
			addAdvert: function(item) {
				return Adverts.save(item).$promise;
			},
			deleteAdvert: function(index) {
				return Adverts.delete({id: index}).$promise;
			}
		};
	}];

	module.factory("advertService", advertService);

}(angular.module("app")));