MODULES.push('UpdateUser');
angular.module('UpdateUser', [])
.service('UpdateUserService', ['$q', '$http', function ($q, $http) {
    var UpdateUserService = {};
    $http = $http
    UpdateUserService.UpdateUserDetails = function (data, $scope) {
        var dobj = $q.defer();
        $http({
            url: path + 'api/user/UpdateUser',
            method: "POST",
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
            data: data,
        }).success(function (data) {
            dobj.resolve(true);
        }).error(function (err) {
            dobj.reject(err);
        });
        return dobj.promise;
    };

    UpdateUserService.saveEmailTemplate = function (data) {
        console.log(data);
        var dobj = $q.defer();
        $http({
            url: path + "api/user/UpdateEmails?userId=" + data.userId + "&templates=" + data.templates,
            method: "GET",
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
            //data: data,
        }).success(function (data) {
            dobj.resolve(true);
        }).error(function (err) {
            dobj.reject(err);
        })
        return dobj.promise;
    };
    UpdateUserService.getEmailTemplate = function (data) {
        var dobj = $q.defer();
        $http({
            url: path + 'api/user/GetEmails',
            method: 'GET',
            params: data,
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        }).success(function (data) {
            dobj.resolve(data);
        }).error(function (err) {
            dobj.reject(err);
        });
        return dobj.promise;
    }

    UpdateUserService.getUserDetails = function (data) {
        var dobj = $q.defer();
        $http({
            url: path + 'api/user/GetUser',
            method: 'GET',
            params: data,
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        }).success(function (data) {
            dobj.resolve(data);
        }).error(function (err) {
            dobj.reject(err);
        });
        return dobj.promise;
    }

    return UpdateUserService;

}])
.controller('UserUpdateController', ['$scope', 'UpdateUserService', '$http', '$compile', function ($scope, UpdateUserService, $http, $compile) {

    $scope.init = function () {
        $scope.loadUserInfo();
    };

    $scope.emailTemplate = [];

    $scope.loadEmailTemplate = function () {
        var param = { userid: $scope.userID };
        UpdateUserService.getEmailTemplate(param).then(function (data) {
            $scope.emailTemplate = data;
        });
    };

    $scope.loadUserInfo = function () {
        $http({
            url: path + 'api/user/GetCurrentUser',
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        }).success(function (data) {
            $scope.userName = data.toString().substring(1, data.toString().length - 1);
            var param = { userid: $scope.userName };
            UpdateUserService.getUserDetails(param).then(function (data) {
                $scope.userID = data.UserID;
                $scope.firstName = data.FirstName.toString();
                $scope.lastName = data.LastName.toString();
                $scope.displayName = data.DisplayName.toString();
                $scope.department = data.Department.toString();
                $scope.email = data.Email.toString();
                $scope.AccountType = !!data.AccountType;
                console.log(data.HasWebCenter);
                console.log(data.Viewer);
                console.log(data.Viewer);
                $scope.Viewer = !!data.Viewer;
                console.log($scope.Viewer);
                //$scope.Viewer = data.Viewer;
                $scope.loadEmailTemplate();
            });
        }).error(function (err) {
            alert('Unable to get user');
        });
    };

    $scope.UpdateUserDetails = function () {
        var msg = [];
        if (!$scope.firstName)
            msg.push('Please Provide First Name');
        else if (!$scope.lastName)
            msg.push('Please Provide Last Name');
        else if (!$scope.displayName)
            msg.push('please Provide Display Name');
        else if (!$scope.department)
            msg.push('Please Provide Department Name');
        else if (!$scope.email)
            msg.push('Please Provide Email');
        console.log(msg.join('<br/>'));
        if (msg.length) {
            $.notify(msg.join('<br/>'), {type:'error'});
        }
        else {
            var data = { FirstName: $scope.firstName, LastName: $scope.lastName, DisplayName: $scope.displayName, Department: $scope.department, Viewer: $scope.Viewer, IsActiveDirectory: false, DomainID: 0, UserName: $scope.userName, Email: $scope.email, UserID: $scope.userID, IsActive: true };
            console.log(data);

            UpdateUserService.UpdateUserDetails(data, $scope).then(function (data) {
                $.notify('User Details has been updated successfully', { type: 'success' });
                window.location.reload();
            }, function (errr) {
                $.notify('Unable to update. Please Check with Admin', { type: 'error' });
            });
        }

    };

    $scope.editupdateEmailTemplate = function () {
        var elm = $compile('<div ng-include="\'updateEmail.html\'"></div>')($scope);
        $scope.popup = $.modal('Email Templates', elm);
    };

    $scope.saveEmailTempalte = function () {
        var templates = [];
        $.each($scope.emailTemplate, function (i, t) {
            if (t.Selected)
                templates.push(t.ID);
        });

        var param = { userId: $scope.userID, templates: templates.toString() };
        UpdateUserService.saveEmailTemplate(param).then(function (data) {
            $.notify('Email Details has been updated successfully', { type: 'success' });
            
        }, function (errr) {
            $.notify('Action Failed', { type: 'error' });
        });
    };

    $scope.closeEmailTemplate = function () {
        if ($scope.popup) {
            $scope.popup.close();
        }
    }
    $scope.ClosePage = function () {
        window.location.href = path + homeUrl
    };

}]);