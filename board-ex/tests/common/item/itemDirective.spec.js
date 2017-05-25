describe('app', function() {
	var scope;

	beforeEach(module('app'));

	beforeEach(module('app/common/item/template/itemTemplate.html'));

	describe('item directive', function() {
		var compile,
			rootScope,
			element;

		beforeEach(inject(function($compile, $rootScope) {
			compile = $compile;
			rootScope = $rootScope;
			scope = $rootScope.$new();
		}));

		it('replaces the element with the appropriate content', function() {
			scope.advert = {
				"id": 123456789,
				"type": "purchase",
				"title": "LG G2",
				"pict": "..\/ui\/pic\/lgg2.jpg"
			};
			element = compile('<li ng-item></li>')(scope);
			scope.$digest();

			expect(element.html()).toContain('123456789');
			expect(element.html()).toContain('purchase');
			expect(element.html()).toContain('LG G2');
			expect(element.html()).toContain('..\/ui\/pic\/lgg2.jpg');

		});
	});
});