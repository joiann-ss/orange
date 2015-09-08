(function () {
    "use strict";
    angular
        .module('orange')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$scope', '$cordovaInAppBrowser', 'Auth', 'OrangeApi',
                           'Patient', 'notifications'];

    /* @ngInject */
    function AccountCtrl($scope, $cordovaInAppBrowser, Auth, OrangeApi, Patient, notify) {

        $scope.login = login;
        $scope.signUp = signUp;
        $scope.goToTerms = goToTerms;
        $scope.error = false;
        $scope.errors = [];
        $scope.user = {};

        function signUp(form) {
            $scope.errors = [];
            if ($scope.user.agreement !== true) {
                $scope.errors.push('Please agree to the Terms of Use')
            }

            if (!form.$valid || $scope.errors.length) {
                $scope.error = true;
            } else {
                $scope.error = false;

                // Prepare User object
                var parts = $scope.user.fullName.split(' ');
                var first_name = parts.shift();
                var last_name = parts.join(' ');
                var user = {
                    'email': $scope.user.email,
                    'password': $scope.user.password,
                    'phone': $scope.user.phone || '',
                    'first_name': first_name,
                    'last_name': last_name
                };

                // Call Api
                OrangeApi.user.post(user).then(
                    function (response) {
                        Auth.auth(user).then(function (status) {
                            if (status === true) {
                                $scope.error = false;
                                $scope.errors = [];

                                Patient.changeStateByPatient();
                                notify.updateNotify();
                            } else {
                                $scope.error = true;
                                $scope.errors = [];
                                $scope.errors.push('Invalid Email or Password')
                            }
                        })
                    },
                    function (error) {
                        $scope.error = true;
                        error.data.errors.forEach(function (elem) {
                            $scope.errors.push(_.startCase(elem))
                        });

                    }
                )
            }
        }

        function login(form) {
            $scope.errors = [];
            if (!form.$valid || $scope.errors.length) {
                $scope.error = true;
            } else {
                var user = {
                    'email': $scope.user.email,
                    'password': $scope.user.password
                };
                Auth.auth(user).then(function (status) {
                    if (status === true) {
                        $scope.error = false;
                        $scope.errors = [];
                        Patient.changeStateByPatient();
                        notify.updateNotify();
                    } else {
                        $scope.error = true;
                        $scope.errors = [];
                        $scope.errors.push('Invalid Email or Password')
                    }
                })
            }
        }

        function goToTerms() {
            $cordovaInAppBrowser.open('http://google.com', '_blank');
        }
    }
})();