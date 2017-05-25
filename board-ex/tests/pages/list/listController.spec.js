describe('app', function() {
	var scope,
		controller;

	beforeEach(module('app'));

	describe('listCtrl', function() {
		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			controller = $controller('listCtrl', {$scope: scope});
		}));

		it('should contain a value from an array', function() {
			expect(scope.resultQty).toContain(scope.qtyOnPage);
		});

		it('should contain a value from an array', function() {
			expect(scope.resultQty).toContain(scope.qtyOnPage);
		});

		describe('scope.choosePage', function() {
			it('should determine necessary set of results on the page (from 0 to 5)', function() {
				scope.choosePage();
				expect(scope.activeItem).toBe(0);
				expect(scope.startNum).toBe(0);
				expect(scope.endNum).toBe(5);
			});

			it('should determine necessary set of results on the page (from 50 to 55)', function() {
				scope.choosePage(10);
				expect(scope.activeItem).toBe(10);
				expect(scope.startNum).toBe(50);
				expect(scope.endNum).toBe(55);
			});
		});

		describe('scope.updatePagination', function() {
			it('should update pageNumArray', function() {
				var objArr = [
					{}, {}, {}, {}, {}, {}
				];

				scope.updatePagination(objArr);
				expect(scope.pageNumArray).toEqual([0, 5]);

				scope.qtyOnPage = 10;
				scope.updatePagination(objArr);
				expect(scope.pageNumArray).toEqual([0]);
			});
		});

		describe('using methods of listService', function () {
			var data = [{
				"id": 0,
				"type": "sale",
				"title": "LG G1",
				"desc": "LG G1 is a good device!",
				"pict": "..\/ui\/pic\/lgg1.jpg"
			}, {
				"id": 1,
				"type": "purchase",
				"title": "LG G2",
				"desc": "LG G2 is a good device!!!",
				"pict": "..\/ui\/pic\/lgg2.jpg"
			}];

			beforeEach(inject(function ($httpBackend) {
				$httpBackend.whenGET('app/pages/home/template/homeTemplate.html').respond(200);
				$httpBackend.whenGET('/advertisements').respond(200, data);
			}));

			it('scope.getAdverts', inject(function ($httpBackend) {
				scope.getAdverts();
				$httpBackend.flush();

				expect(scope.adverts[0].id).toBe(data[0].id);
				expect(scope.adverts[1].id).toBe(data[1].id);
			}));
		});
	});
});