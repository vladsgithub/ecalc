describe('app', function() {
	var scope;

	beforeEach(module('app'));

	describe('imageonload directive', function() {
		var compile,
			rootScope;

		beforeEach(inject(function($compile, $rootScope) {
			compile = $compile;
			rootScope = $rootScope;
			scope = $rootScope.$new();
		}));

		it('sets a key', function() {
			scope.advert = {};

			compile('<img imageonload ng-src="/nopicture" />')(scope);
			scope.$digest();

			expect(scope.advert.isPictLoaded).toEqual(false);
		});
	});
});