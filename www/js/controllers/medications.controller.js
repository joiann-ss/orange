(function () {
    "use strict";
    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['$scope', 'OrangeApi', '$stateParams'];

    /* @ngInject */
    function MedicationsCtrl($scope, OrangeApi, $stateParams) {
        //console.log(ipsumService.randomName());
        if ($stateParams.id) {
            $scope.medication = OrangeApi.medications.get($stateParams.id);
        } else {

            $scope.medications = [];
            $scope.shouldShowDelete = false;
            $scope.toggleDelete = function () {
                $scope.shouldShowDelete = !$scope.shouldShowDelete;
            };

            $scope.removeNote = function (id) {
            }
        }

    }
})();


