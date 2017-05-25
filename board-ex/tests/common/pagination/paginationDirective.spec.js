describe('app', function() {
	var scope;

	beforeEach(module('app'));

	beforeEach(module('app/common/pagination/template/paginationTemplate.html'));

	describe('pagination directive', function() {
		var compile,
			rootScope,
			element;

		beforeEach(inject(function($compile, $rootScope) {
			compile = $compile;
			rootScope = $rootScope;
			scope = $rootScope.$new();
		}));


		it('replaces the element with the appropriate content', function() {
			scope.pageNumArray = [5, 10, 50, 100];
			element = compile('<pagination></pagination>')(scope);
			scope.$digest();

			expect(element.html()).toContain('title="Page #4');
		});
	});
});