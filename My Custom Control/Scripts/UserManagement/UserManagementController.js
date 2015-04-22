var APP = angular.module('UserManagement', ['glams.audit']);

var templateRoles = '<div id="Role-Template" class="user-management" style="display: none">' +
                                '<div class="selectAll">' +
                                    '<label for="Checkbox{{$id}}" class="labeltext">Select All</label>' +
                                    '<input type="checkbox" name="Checkbox{{$id}}" id="Checkbox{{$id}}" ng-checked="RolesAllSelected" ng-click="selectRoleAll()" >' +
                                    '<label for="Checkbox{{$id}}"></label>' +
                                '</div>' +
                                '<div class="clearfix">' +
                                    '<div class="row">' +
                                        '<div class="column span-8" scrollable>' +
                                            '<div class="option" ng-repeat="srole in Roles">' +
                                                '<input type="checkbox" name="Checkbox{{$id}}" id="Checkbox{{$id}}" ng-model="srole.Selected" ng-click="roleCheck(srole)">' +
                                                '<label for="Checkbox{{$id}}"></label>' +
                                                '<label for="Checkbox{{$id}}">{{srole.Name}}</label>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="column span-4" scrollable>' +
                                            '<b>Selected Role\'s</b>' +
                        '<div class="selectedListContainer" scrollable><span class="selectedlist" ng-repeat="srole in Roles| filter:true" ng-click="roleSelectedListCheck(srole)">{{srole.Name}}</span>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                    '</div>';

var templateEmail = '<div id="Email-Template" class="user-management" style="display: none">' +
                                '<div class="selectAll">' +
                                    '<label for="Checkbox{{$id}}" class="labeltext">Select All</label>' +
                                    '<input type="checkbox" name="Checkbox{{$id}}" id="Checkbox{{$id}}" ng-checked="EmailAllSelected" ng-click="selectAllEmail()" >' +
                                    '<label for="Checkbox{{$id}}"></label>' +
                                '</div>' +
                                '<div class="clearfix">' +
                                    '<div class="row">' +
                                        '<div class="column span-8" scrollable>' +
                                            '<div class="option" ng-repeat="email in Emails">' +
                                                '<input type="checkbox" name="Checkbox{{$id}}" id="Checkbox{{$id}}" ng-model="email.Selected" ng-click="emailCheck(email)">' +
                                                '<label for="Checkbox{{$id}}"></label>' +
                                                '<label for="Checkbox{{$id}}">{{email.Name}}</label>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="column span-4" scrollable>' +
                                            '<b>Selected Email Template\'s</b>' +
                        '<div class="selectedListContainer" scrollable><span class="selectedlist" ng-repeat="email in Emails| filter:true" ng-click="emailSelectedListCheck(email)">{{email.Name}}</span>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                    '</div>';

var templateChangePassword = '<div style="display: none" id="popup-template" class="user-management">' +
        '<div align="right">' +
            '<a class="button light" ng-click="resetPassword()">' +
                '<img src="../../Content/images/UserManagment/reset.png" />' +
                'Reset Password</a>' +
        '</div>' +
        '<div class="input-block">' +
            '<label for="password" style="min-width: 120px !important">Password <span class="hint-text red">*</span></label>' +
            '<input type="password" name="password" size="40" ng-keyup="testPassword()" id="password1" ng-class="{error:!Error.Key.valid}" ng-model="UserInfo.Key" maxlength="100" />' +
            '<span ng-show="!Error.Key.valid" class="error">{{Error.Key.msg}}' +
            '</span>' +
            '<span class="hint-text green">{{Error.Key.strength}}</span>' +
        '</div>' +
        '<div class="input-block">' +
            '<label for="password2" style="min-width: 120px !important">Confirm Password <span class="hint-text red">*</span></label>' +
            '<input type="password" name="password2" size="40" id="password2" maxlength="100" />' +
        '</div>' +
    '</div>';


(function () {
    var showLoader = function () {
        removeLoader();
        $('<div class="gif-loading"><div> </div></div>').appendTo('body');
    };

    var removeLoader = function () {
        $('.gif-loading').remove();
    };

    APP.factory("UserService", [
        '$http', '$q', 'Audit',
        function ($http, $q, Audit) {
            var httpRestValue = path + 'api/user/';
            var UserService = {
                data: {
                    UserInfo: {
                        UserID: '',
                        UserName: '',
                        FirstName: '',
                        LastName: '',
                        DisplayName: '',
                        Department: '',
                        Email: '',
                        AccountType: false,
                        DomainID: -1,
                        Viewer: false,
                        Locked: false,
                        Groups: [],
                        Key: ''
                    },
                    Domain: []
                },
                getRoles: function (scope) {
                    //showLoader();
                    $http.get(httpRestValue + "GetRoles?userName=" + scope.UserInfo.UserName, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {

                            scope.Roles = data;

                            var selected = true;
                            $(scope.Roles).each(function (i, g) {
                                if (!g.Selected)
                                    selected = false;
                            });


                            scope.RolesAllSelected = selected;
                            setTimeout(function () {
                                $('[scrollable]').getNiceScroll().resize();
                            }, 300);
                            //removeLoader();
                        })
                        .error(function error() { });
                },
                getEmails: function (scope) {
                    if (scope.UserInfo.UserID) {
                        $http.get(httpRestValue + "GetEmails?userId=" + scope.UserInfo.UserID, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                            .success(function success(data) {

                                scope.Emails = data;

                                var selected = true;
                                $(scope.Emails).each(function (i, g) {
                                    if (!g.Selected)
                                        selected = false;
                                });


                                scope.emailAllSelected = selected;
                                setTimeout(function () {
                                    $('[scrollable]').getNiceScroll().resize();
                                }, 300);
                            })
                            .error(function error() { });
                    }
                },
                addRoles: function (scope, successCallBack, errorCallBack) {
                    var selectedRoles = [];
                    $(scope.Roles).each(function (i, r) {
                        if (r.Selected)
                            selectedRoles.push(r.Name);
                    });

                    showLoader();

                    $http({
                        url: httpRestValue + "AddRoles?userName=" + scope.UserInfo.UserName + '&roles=' + selectedRoles.toString(),
                        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                        method: 'GET'
                    }).success(function success(data) {
                        removeLoader();
                        successCallBack();
                    }).error(function error() { removeLoader(); errorCallBack(); });

                },
                addEmails: function (scope, successCallBack, errorCallBack) {
                    var selectedTemplates = [];
                    $(scope.Emails).each(function (i, r) {
                        if (r.Selected)
                            selectedTemplates.push(r.ID);
                    });

                    showLoader();

                    $http({
                        url: httpRestValue + "UpdateEmails?userId=" + scope.UserInfo.UserID + '&templates=' + selectedTemplates.toString(),
                        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                        method: 'GET'
                    }).success(function success(data) {
                        removeLoader();
                        successCallBack();
                    }).error(function error() { removeLoader(); errorCallBack(); });
                },
                getUserInfo: function (userId, scope) {
                    showLoader();
                    $http.get(httpRestValue + "GetUser/?userid=" + userId, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            UserService.data.UserInfo = data;
                            scope.UserInfo = data;
                            scope.Audit = $.extend(true, {}, scope.UserInfo);
                            setTimeout(function () {
                                $('[scrollable]').getNiceScroll().resize();
                            }, 300);
                            UserService.getRoles(scope);
                            UserService.getEmails(scope);
                            removeLoader();
                        })
                        .error(function error() { });
                },
                getDomain: function (scope) {
                    showLoader();
                    $http.get(httpRestValue + "GetDomain/", { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            UserService.data.Domain = data;
                            scope.Domain = data;
                            removeLoader();
                        })
                        .error(function error() { });
                },
                updateUser: function (scope) {
                    showLoader();
                    $http.post(httpRestValue + "UpdateUser", scope.UserInfo, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            var newAudit = $.extend(true, {}, scope.UserInfo);
                            function auditDataHelper(auditObj) {
                                auditObj.AuditName = auditObj.UserName;
                                $.each(auditObj.Groups, function (i, gp) {
                                    gp.AuditName = auditObj.AuditName + " -> Group Type(" + gp.Name + ")";
                                    delete gp['Selected'];
                                    delete gp['$$hashKey'];
                                    $.each(gp.Groups, function (j, g) {
                                        g.AuditName = gp.AuditName + " -> Group(" + g.Name + ")";
                                        delete g.GroupId;
                                        delete g['$$hashKey'];
                                    });
                                });

                                delete auditObj['$$hashKey'];
                                return auditObj;
                            }
                            
                            Audit.log(Audit.Type.USER, scope.Audit, newAudit, auditDataHelper).then(function () {
                                removeLoader();
                                $.notify('User updated successfully', { position: 'bottom right', type: 'success' });
                                //scope.close();
                                scope.Audit = newAudit;
                            }, function () { removeLoader(); });
                        })
                        .error(function error(e) {
                            removeLoader();
                            $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                        });
                },
                addUser: function (scope) {
                    showLoader();
                    $http.post(httpRestValue + "AddUser", scope.UserInfo, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            removeLoader();
                            $.notify('User added successfully', { position: 'bottom right', type: 'success' });
                            //scope.close();
                        })
                        .error(function error(e) {
                            removeLoader();
                            $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                        });
                },
                toggleUser: function (scope) {
                    showLoader();
                    $http.get(httpRestValue + "LockUser?username=" + scope.UserInfo.UserName, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            removeLoader();
                            scope.UserInfo.Locked = !scope.UserInfo.Locked;
                            $.notify("User " + (scope.UserInfo.Locked ? 'locked' : 'unlocked') + " successfully", { position: 'bottom right', type: 'success' });
                        })
                        .error(function error(e) {
                            removeLoader();
                            $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                        });
                },
                resetPassword: function (scope) {
                    showLoader();

                    $http.get(httpRestValue + "ResetPassword?username=" + scope.UserInfo.UserName, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                       .success(function success(data) {
                           removeLoader();
                           switch (+data) {
                               case 1:
                                   $.notify("Reset password will not available for LDAP users, please use change password functionality", { position: 'bottom right', type: 'warning' });
                                   break;
                               case 2:
                                   $.notify("New password has been sent to your registered email", { position: 'bottom right', type: 'info' });
                                   break;
                           }
                       })
                       .error(function error(e) {
                           removeLoader();
                           $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                       });
                },
                changePassword: function (scope, successCallBack, errorCallBack) {
                    scope.Error.Key.strength = '';
                    var regx = new RegExp(scope.PasswordValidator);
                    var valid = true;
                    if (!scope.UserInfo.Key || scope.UserInfo.Key.length < 8 || scope.passwordStrength(scope.UserInfo.Key) == 'Weak' || !regx.test(scope.UserInfo.Key)) {
                        scope.Error.Key.valid = false;
                        scope.Error.Key.msg = 'Password should have atleast 8 Character (include an Uppercase,a Numeric and special character)';
                        valid = false;
                    }
                    else if ($('.popup [type="password"]').eq(1).val() != scope.UserInfo.Key) {
                        scope.Error.Key.valid = false;
                        scope.Error.Key.msg = 'Password doesnot match with confirm password';
                        valid = false;
                    }
                    if (valid) {
                        showLoader();
                        $http.post(httpRestValue + "ChangePassword", scope.UserInfo, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                         .success(function success(data) {
                             removeLoader();
                             successCallBack();
                         })
                         .error(function error(e) {
                             removeLoader();
                             errorCallBack();
                         });
                    }
                    scope.$apply();
                },
                validate: function (scope) {
                    var valid = true;

                    var validator = {
                        Alphabets: /[a-zA-Z0-9._]/,
                        Email: /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/
                    };

                    if (!(validator.Alphabets.test(scope.UserInfo.UserName)) || $.trim(scope.UserInfo.UserName).length < 1) {
                        scope.Error.UserName.valid = false;
                        scope.Error.UserName.msg = 'Enter Valid UserName (Allowed Char: A-Z,a-z,._,0-9)';
                        valid = false;
                    }
                    if (!(validator.Alphabets.test(scope.UserInfo.FirstName)) || $.trim(scope.UserInfo.FirstName).length < 1) {
                        scope.Error.FirstName.valid = false;
                        scope.Error.FirstName.msg = 'Enter valid FirstName (Allowed Char: A-Z,a-z,._,0-9)';
                        valid = false;
                    }
                    if (!(validator.Alphabets.test(scope.UserInfo.LastName)) || $.trim(scope.UserInfo.LastName).length < 1) {
                        scope.Error.LastName.valid = false;
                        scope.Error.LastName.msg = 'Enter valid LastName (Allowed Char: A-Z,a-z,._,0-9)';
                        valid = false;
                    }
                    if (!(validator.Alphabets.test(scope.UserInfo.DisplayName)) || $.trim(scope.UserInfo.DisplayName).length < 1) {
                        scope.Error.DisplayName.valid = false;
                        scope.Error.DisplayName.msg = 'Enter valid DisplayName (Allowed Char: A-Z,a-z,._,0-9)';
                        valid = false;
                    }
                    if (!(validator.Alphabets.test(scope.UserInfo.Department)) || $.trim(scope.UserInfo.Department).length < 1) {
                        scope.Error.Department.valid = false;
                        scope.Error.Department.msg = 'Enter valid Department (Allowed Char: A-Z,a-z,._,0-9)';
                        valid = false;
                    }
                    if (!(validator.Email.test(scope.UserInfo.Email))) {
                        scope.Error.Email.valid = false;
                        scope.Error.Email.msg = 'Enter Valid Email';
                        valid = false;
                    }
                    if (scope.isNewUser()) {
                        scope.Error.Key.strength = '';
                        var regx = new RegExp(scope.PasswordValidator);
                        if (!scope.UserInfo.Key || scope.UserInfo.Key.length < 8 || !regx.test(scope.UserInfo.Key)) {
                            scope.Error.Key.valid = false;
                            scope.Error.Key.msg = 'Password should have atleast 8 Character (include an Uppercase,a Numeric and special character)';
                            valid = false;
                        }
                        else if ($('#cpassword').val() != scope.UserInfo.Key) {
                            scope.Error.Key.valid = false;
                            scope.Error.Key.msg = 'Password doesnot match with confirm password';
                            valid = false;
                        }
                    }

                    return valid;
                },
                getPwdvalidator: function(scope){
                    $http.get(httpRestValue + "getpwdValidator",{ 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                       .success(function success(data) {
                           scope.PasswordValidator = data.substr(1, data.length - 2);
                           scope.PasswordValidator = scope.PasswordValidator.replace(/\\\\/gi, "\\");
                       })
                       .error(function error(e) {
                           scope.PasswordValidator = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\$\\!]).{8,}';
                       });
                }


            };
            return UserService;
        }]);

    APP.controller("UserManagementController", ['$scope', '$compile', '$http', 'UserService', 'Audit', function ($scope, $compile, $http, UserService, Audit) {

        $scope.UserInfo = {};
        $scope.Domain = [];

        var urlParam = window.location.href.split('/');
        var userName = urlParam[urlParam.length - 1];

        $scope.UserId = (userName == '0') ? '' : userName;
        $scope.Roles = [];
        $scope.RolesAllSelected = false;
        $scope.EmailAllSelected = false;
        $scope.Emails = [];

        $scope.Error = {
            UserName: { valid: true, msg: '' },
            FirstName: { valid: true, msg: '' },
            LastName: { valid: true, msg: '' },
            DisplayName: { valid: true, msg: '' },
            Department: { valid: true, msg: '' },
            Email: { valid: true, msg: '' },
            Key: { valid: true, msg: '', strength: '' }
        }

        $scope.isNewUser = function () {
            return ($scope.UserId == "");
        };

        $scope.hasDomain = function () {
            return $scope.Domain.length ? true : false;
        };

        $scope.setAccountType = function () {
            $scope.UserInfo.AccountType = false;
        };

        $scope.setDomain = function () {
            if ($scope.UserInfo.AccountType && ($scope.UserInfo.DomainID <= 0)) {
                $scope.UserInfo.DomainID = $scope.Domain[0].ID;
            }
            else {
                $scope.UserInfo.DomainID = 0;
            }
        };

        $scope.init = function () {
            UserService.getUserInfo($scope.UserId, $scope);
            UserService.getDomain($scope);
            UserService.getPwdvalidator($scope);            
        };

        $scope.selectAll = function (group) {
            group.Selected = !group.Selected;
            $(group.Groups).each(function (i, g) {
                g.Selected = group.Selected;
            });
        };

        $scope.groupCheck = function (sgroup, group) {
            sgroup.Selected = !sgroup.Selected;
            var selected = true;
            $(group.Groups).each(function (i, g) {
                if (!g.Selected) {
                    selected = false;
                }
            });
            group.Selected = selected;
        };

        $scope.selectRoleAll = function () {
            $scope.RolesAllSelected = !$scope.RolesAllSelected;
            $($scope.Roles).each(function (i, g) {
                g.Selected = $scope.RolesAllSelected;
            });
        };

        $scope.roleCheck = function (role) {
            var selected = true;
            $($scope.Roles).each(function (i, g) {
                if (!g.Selected)
                    selected = false;
            });
            $scope.RolesAllSelected = selected;
        };

        $scope.emailCheck = function (role) {
            var selected = true;
            $($scope.Emails).each(function (i, g) {
                if (!g.Selected)
                    selected = false;
            });
            $scope.EmailAllSelected = selected;
        };

        $scope.roleSelectedListCheck = function (role) {
            role.Selected = false;
            $scope.RolesAllSelected = false;
        };

        $scope.emailSelectedListCheck = function (email) {
            email.Selected = false;
            $scope.EmailAllSelected = false;
        };

        $scope.groupSelectedListCheck = function (sgroup, group) {
            sgroup.Selected = false;
            group.Selected = false;
        };

        $scope.close = function () {
            //window.parent.glams.modal.getAll()[0].close();
            //window.location.href = path + 'User';
            window.parent.location.reload();
        };

        $scope.save = function () {
            if (UserService.validate($scope)) {
                if ($scope.isNewUser()) {
                    UserService.addUser($scope);
                    window.location.href = path + 'User';
                }
                else {
                    UserService.updateUser($scope);
                    // audit for update
                }
                    
            }
        };

        $scope.toggleUser = function () {
            UserService.toggleUser($scope);
        };

        $scope.resetPassword = function () {
            UserService.resetPassword($scope);
        };

        $scope.changeResetPassword = function () {
            $scope.UserInfo.Key = "";
            var content = $compile(templateChangePassword)($scope);
            var pObj = showPopup('Change Password', content.show(), { width: 880, height: 300 });
            $(pObj[1]).on('click', function () {
                UserService.changePassword($scope, function () {
                    $(pObj[0]).remove();
                    $.notify("Password changed successfully", { position: 'bottom right', type: 'success' });
                }, function () {
                    $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                });
            });
        };

        $scope.UpdateRoles = function () {
            $scope.UserInfo.Key = "";
            var content = $compile(templateRoles)($scope);
            var pObj = showPopup('Edit Roles', content.show(), { width: 880, height: 300 });
            $(pObj[1]).on('click', function () {
                UserService.addRoles($scope, function () {
                    $(pObj[0]).remove();
                    $.notify("Roles changed successfully", { position: 'bottom right', type: 'success' });
                }, function () {
                    $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                });
            });
        };

        $scope.UpdateEmail = function () {
            $scope.UserInfo.Key = "";
            var content = $compile(templateEmail)($scope);
            var pObj = showPopup('Edit Email Templates', content.show(), { width: 880, height: 300 });
            $(pObj[1]).on('click', function () {
                UserService.addEmails($scope, function () {
                    $(pObj[0]).remove();
                    $.notify("Email template changed successfully", { position: 'bottom right', type: 'success' });
                }, function () {
                    $.notify('Unable to process your request. Please try again', { position: 'bottom right', type: 'error' });
                });
            });
        };

        $scope.testPassword = function () {
            $scope.Error.Key.msg = "";
            $scope.Error.Key.valid = true;

            $scope.Error.Key.strength = $scope.passwordStrength($scope.UserInfo.Key);
        };

        $scope.passwordStrength = function (pwString) {
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
        };

    }]);
})();