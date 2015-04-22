MODULES.push('ChangePassword');
angular.module('ChangePassword', [])
    .service('ChangePasswordService', ['$q', '$http', function ($q, $http) {
        var ChangePasswordService = {};
        $http = $http
        ChangePasswordService.changePassword = function (data, $scope) {
            var msg = [];
            var dobj = $q.defer();
            $http({
                url: path + '/api/user/ChangePassword',
                method: 'POST',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                data: data,
            }).success(function (data) {
                if (data.toString().substring(1, data.toString().length - 1) == 1) {
                    msg.push('Invalid old password');
                }
                else if (data.toString().substring(1, data.toString().length - 1) == 2) {

                    msg.push('Password has been changed succesfully');
                    $scope.oldpwd = "";
                    $scope.newpwd = "";
                    $scope.cnfpwd = "";
                }
                else {
                    msg.push('Action failed. Kindly check with admin.');
                }
                if (msg.length) {
                    $.alert(msg.join('<br/>'));
                }
                dobj.resolve(data);
            }).error(function (err) {
                dobj.reject(err);
            });
            return dobj.promise;
        };

        return ChangePasswordService;
    }])
    .controller('changePasswordCntrl', ['$scope', 'ChangePasswordService', '$http', function ($scope, ChangePasswordService, $http) {
        var msg = [];
        $http({
            url: path + '/api/user/GetCurrentUser',
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        }).success(function (data) {
            $scope.userName = data.toString().substring(1, data.toString().length - 1); 
        }).error(function (errr) { msg.push('Unable to Get User'); $.alert(msg.join('<br/>')); });



        $scope.resetField = function () {
            console.log('reached');
            $scope.oldpwd.text = "";

        };

        $scope.passwordStrength = function (pwString) {
            if (!pwString)
                return "";
            var strength = 0;
            var msg = '';

            strength += /[A-Z]+/.test(pwString) ? 1 : 0;
            strength += /[a-z]+/.test(pwString) ? 1 : 0;
            strength += /[0-9]+/.test(pwString) ? 1 : 0;
            strength += /[\W]+/.test(pwString) ? 1 : 0;

            switch (strength) {
                case 3:
                    msg = 'Medium';
                    break;
                case 4:
                    msg = 'Strong';
                    break;
                default:
                    msg = 'Weak';
                    break;
            }
            return msg;
            cosole.log(msg);
        };

        $scope.changePassword = function () {
            var msg = [];
            if (!$scope.oldpwd)
                msg.push('Please enter old password');
            else if (!$scope.newpwd)
                msg.push('Please enter new password');
            else if (!$scope.cnfpwd)
                msg.push('Please enter confirm password')
            else if ($scope.newpwd != $scope.cnfpwd)
                msg.push('Password does not match');
            else if ($scope.oldpwd == $scope.newpwd)
                msg.push('Old Password and new password cannot be same');
            if (msg.length) {
                $.alert(msg.join('<br/>'));
            }
            else {
                var data = { key: $scope.oldpwd, ReConfirmKey: $scope.newpwd, UserName: $scope.userName };
                ChangePasswordService.changePassword(data, $scope).then(function (data) {

                }, function (err) {
                    $scope.MyName = "Rakesh";
                    $.alert(err.Message, { icon: 'error' });
                });
            }

        };
        $scope.Cancel = function () {
            window.location.href = path + homeUrl
        };

    }]);

