(function (module) {

	function validationMessage(scope) {
		var message = '';
		scope.validated = true;

		if (scope.advertForm.type.$invalid) message += '- Please choose type of the advert;\n';
		if (scope.advertForm.title.$invalid) message += '- Please write a title of the advert;\n';
		if (scope.advertForm.picture.$invalid) message += '- Please add URL address of picture;\n';
		if (scope.advert && !scope.advert.isPictLoaded) message += '- URL address of the picture is wrong. Please change it;\n';

		return message;
	}



	var advertCtrl = ['$scope', '$stateParams', '$state', 'advertService',
		function ($scope, $stateParams, $state, advertService) {
			$scope.btnName = 'Change';

			advertService.getAdvert($stateParams.number).then(function (response) {
				$scope.advert = response;
				//$scope.title = $scope.advert.title;

				if ($scope.advert.id === undefined) {
					$state.go('404');
				}
			});

			$scope.submit = function () {
				var question;
				var message = validationMessage($scope);

				if (message.length > 0) {
					alert(message);
				} else {
					question = confirm("Do you want to change this advert? Are you sure?");

					if (question) {
						advertService.updateAdvert($scope.advert);
					}
				}
			};

			$scope.deleteItem = function (index) {
				var question = confirm("Do you want to delete this advert? Are you sure?");

				if (question) {
					advertService.deleteAdvert(index).then(function (response) {
						$state.go('adverts');
					});
				}
			};
		}];

	var newAdvertCtrl = ['$scope', '$state', 'advertService',
		function ($scope, $state, advertService) {
			$scope.title = 'New advert';
			$scope.btnName = 'Add';

			$scope.submit = function () {
				var question;
				var message = validationMessage($scope);

				if (message.length > 0) {
					alert(message);
				} else {
					question = confirm("Do you want to add this advert? Are you sure?");

					if (question) {
						advertService.addAdvert($scope.advert).then(function(response) {
							$scope.advert = response;
							$state.go('advert', {number: $scope.advert.id});
						});
					}
				}
			};
		}];

	module.controller('advertCtrl', advertCtrl);
	module.controller('newAdvertCtrl', newAdvertCtrl);

}(angular.module("app")));