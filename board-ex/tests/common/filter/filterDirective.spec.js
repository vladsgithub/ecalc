describe('app', function() {
	var scope;

	beforeEach(module('app'));

	beforeEach(module('app/common/filter/template/filterTemplate.html'));

	describe('filter directive', function() {
		var compile,
			rootScope,
			element,
			controller;

		beforeEach(inject(function($compile, $rootScope, $controller) {
			compile = $compile;
			rootScope = $rootScope;
			scope = $rootScope.$new();
			controller = $controller('listCtrl', {$scope: scope});
		}));

		it('replaces the element with the appropriate content', function() {
			element = compile('<filter></filter>')(scope);
			scope.$digest();

			expect(element.html()).toContain('</select>');
		});
	});
});