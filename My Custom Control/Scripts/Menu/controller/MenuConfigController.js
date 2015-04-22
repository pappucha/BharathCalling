var APP = angular.module('MenuConfig', ['glams.audit']);
var EDITMENU = '.edit-menu-wrapper';
var MENUCONFIG = '.menu-config';
var ACTIVE = 'active';
MODULES.push('MenuConfig');
(function ($) {
    APP.controller('MenuConfigController', ['$scope', '$http', '$compile', '$timeout','Audit',
        function ($scope, $http, $compile, $timeout, Audit) {

            $scope.menuTree = {};
            $scope.menu = {};
            $scope.tPosition = { left: 0, top: 0 };
            $scope.selectedScope = [];
            $scope.Roles = [];
            $scope.TaskTemplates = [];

            $scope.init = function () {
                $scope.loadMenu();

                $(document).on('keypress', function (e) {
                    e.stopPropagation();
                    var key = e.which | e.keyCode;
                    if (key == 27)
                        $scope.Utility.removeEditor();
                });
            };

            $scope.initSortable = function () {
                $scope.menu = $.extend(true, {}, $scope.menu);
                $scope.$apply(function () {
                    $timeout(function () {
                        if ($('[sortable]').sortable("instance"))
                            $('[sortable]').sortable('refresh');
                    }, 50);
                });
            };

            $scope.sortHandler = function (event, ui) {
                $scope.initSortable();
            };

            $scope.Utility = {
                deleteNode: function (event) {
                    var elmScope = angular.element($(event.target).parent()).scope();
                    var root = elmScope.$parent.$parent.menu.ChildNodes;
                    var index = $.inArray(elmScope.menu, root);
                    $scope.Utility.removeEditor();
                    root.splice(index, 1);
                },
                addNode: function (event) {
                    var mObj = {
                        description: '',
                        edit: true,
                        ChildNodes: [],
                        title: 'Untitled Menu',
                        visible: true,
                        taskName: '',
                        action: 'Index',
                        controller: 'Request',
                        Type: '',
                        url: ''
                    };

                    var objectRoles = [];
                    $.each($scope.Roles, function (i, r) {
                        var obj = {};
                        obj.Selected = false;
                        obj.Name = r;
                        objectRoles.push(obj);
                    });

                    mObj.roles = objectRoles;
                    var elm = $(event.target).parent();
                    var elmScope = angular.element(elm).scope();
                    var root = elmScope.$parent.$parent.menu.ChildNodes;
                    var index = $.inArray(elmScope.menu, root);
                    $scope.Utility.removeEditor();
                    root.splice(index + 1, 0, mObj);
                    $timeout(function () {
                        $scope.Utility.editNode(null, elm.closest('li').next().find('.menu'));
                    }, 200);
                },
                editNode: function (event, elm) {
                    if (!elm)
                        elm = $(event.target).parents('.menu').eq(0);

                    var elmScope = angular.element(elm).scope();
                    $scope.selectedScope = elmScope.$parent.menu;

                    /*var taskSplit = $scope.selectedScope.url.split('&');

                    if (taskSplit.length > 1)
                        $scope.selectedScope.Task = taskSplit[1].split('=')[1];*/
                    $scope.Utility.showEditor(elm);
                },
                isVisible: function (menu) {
                    if (menu) {
                        return menu.hasOwnProperty('visible') ? menu.visible : true;
                    }
                    return true;
                },
                isEditable: function (menu) {
                    if (menu)
                        return menu.edit;
                    return true;
                },
                removeEditor: function () {
                    $(EDITMENU).remove();
                    $(MENUCONFIG + ' .' + ACTIVE).removeClass(ACTIVE);
                },
                validate: function () {
                    var data = $scope.Utility.prepareMenuData($.extend(true, {}, $scope.menu));
                    var isValid = true;
                    var msg = '';
                    if ($.trim($scope.selectedScope.title) == "") {
                        msg = msg + '<li>Enter Valid Menu Title</li>';
                        isValid = false;
                    }
                    if ($.trim($scope.selectedScope.taskName) == "") {
                        msg = msg + '<li>Selcect Valid Menu Task</li>';
                        isValid = false;
                    }

                    if ($scope.Utility.hasDuplicateTitle($scope.selectedScope.title)) {
                        msg = msg + '<li>Menu with same title already exist</li>';
                    }

                    /*if (!$scope.selectedScope.gridconfig)// && $scope.Utility.hasDuplicateUrl(data[1])) {
                        msg = msg + '- Task already used by a menu. Try choosing another task\n';
                        isValid = false;
                    }*/

                    if (msg != "") {
                        $.notify('<ul>' + msg + '</ul>', {type:'error'});
                    }
                    else {
                        $scope.Utility.removeEditor();
                    }
                    return isValid;
                    return true;
                },
                selectGridConfig: function () {
                    $scope.selectedScope.gridconfig = !$scope.selectedScope.gridconfig;
                    if ($scope.selectedScope.gridconfig) {
                        $scope.selectedScope.Task = "";
                    }
                },
                showEditor: function (elm) {
                    if (elm.next().is('.edit-menu-wrapper')) {
                        $scope.Utility.removeEditor();
                        return true;
                    }

                    var template = '<div class="edit-menu-wrapper">' +
                                        '<div class="editmenu">' +
                                            '<a href="" class="close close-btn" ng-click="Utility.validate()">×</a>' +
                                            '<div class="input-block">' +
                                                '<label for="title">Title</label><input id="title" maxlength="30" type="text" ng-model="selectedScope.title"/>' +
                                            '</div>' +
                                            '<div class="input-block">' +
                                                '<label for="title">Task</label><select id="task" ng-model="selectedScope.taskName" ng-options="t.Name as t.Name for t in TaskTemplates"></select>' +
                                            '</div>' +
                                            '<div class="input-block">' +
                                                '<label for="title">Type</label>' +
                                                '<select id="type" ng-model="selectedScope.Type">' +
                                                    '<option value="Default">Default</option>' +
                                                    '<option value="AddJob">AddJob</option>' +
                                                '</select>' +
                                            '</div>' +
                                            '<div class="input-block last">' +
                                                '<label for="title">Roles</label>' +
                                                '<div class="roles">' +
                                                    '<span ng-repeat="role in selectedScope.roles">' +
                                                        '<input type="checkbox" id="role_{{$id}}" ng-model="role.Selected" />' +
                                                            '<label for="role_{{$id}}">{{role.Name}}</label>' +
                                                    '</span>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                    var editor = $compile(template)($scope);                    
                    elm.addClass(ACTIVE);
                    $scope.Utility.removeEditor();
                    editor.insertAfter(elm);
                    editor.find('input').eq(0).focus();
                    $('.menu-tree').animate({ scrollTop: editor.position().top + $('.menu-tree').scrollTop()});
                    /*var position = $scope.Utility.getEditorPosition(elm, editor.find('.editmenu'));
                    editor.find('.editmenu').css(position);*/
                },
                getEditorPosition: function (elm, editor) {
                    var position = elm.position();
                    var eH = editor.height();
                    var maxH = $(window).height();
                    var calcPosition = 0;

                    position.left = elm.outerWidth() + position.left;

                    calcPosition = position.top + eH + 310 - $('.menu-tree').scrollTop();

                    if (calcPosition > maxH)
                        position.top = position.top + 6 - eH;

                    return position;
                }

                , prepareMenuData: function (cloneMenu) {
                    //var urls = [];
                    (function iterate(d) {
                        //roles
                        var role = '';
                        $.each(d.roles, function (i, r) {
                            if (r.Selected)
                                role = role + "," + r.Name;
                        });

                        //gridconfig

                        //d.Id = uuid();

                        /*if (d.gridconfig && d.url.indexOf('PageID') == -1) {
                            if (d.url.indexOf('?TaskName') > 0) {
                                var tUrl = d.url.split('?');
                                d.url = tUrl[0] + '?PageID=' + uuid() + '&TaskName=' + tUrl[1].split('=')[1];
                            } else {
                                d.url = '/Grid.aspx?' + 'PageID=' + uuid();
                            }
                        }

                        if (d.url.indexOf('&TaskName') > 0) {
                            var tUrl = d.url.split('&');
                            var taskName = tUrl[1].split('=')[1];

                            if (taskName != d.Task)
                                d.url = tUrl[0] + '&TaskName=' + d.Task;
                        }
                        else if (d.url.indexOf('?TaskName') > 0) {
                            var tUrl = d.url.split('?');
                            var taskName = tUrl[1].split('=')[1];

                            if (taskName != d.Task)
                                d.url = tUrl[0] + '?TaskName=' + d.Task;
                        }
                        else if (d.Task) {
                            d.url = '/Display/Workflow/AddComponent.aspx?TaskName=' + d.Task;
                        }*/
                        d.roles = role.ltrim(',');

                        if (d.roles.length < 2)
                            d.roles = '*';

                        //if (!d.hasOwnProperty('visible')) {
                        //    d.visible = true;
                        //}

                        //urls.push(d);

                        if (d.ChildNodes) {
                            if (d.ChildNodes.length)
                                $.each(d.ChildNodes, function (i, d) {
                                    iterate(d);
                                });
                        }
                    })(cloneMenu);

                    return cloneMenu;
                },
                hasDuplicateTitle: function (title) {
                    var duplicate = 0;
                    (function iterate(menu) {
                        if (menu.title == title)
                            duplicate++;
                        if (menu.ChildNodes.length) {
                            $.each(menu.ChildNodes, function (i, m) {
                                iterate(m);
                            });
                        }
                    })($scope.menu);

                    return duplicate>1?true:false;
                }
                //hasDuplicateUrl: function (urls) {
                //    var duplicateUrl = false;
                //    Enumerable.From(urls).GroupBy("$.taskName", null, function (key, g) {
                //        if (g.Count() > 1) {
                //            if (key) {
                //                duplicateUrl = true;
                //            }
                //        }
                //    }).ToArray();

                //    return duplicateUrl;
                //}

            };

            $scope.save = function () {

                if ($(EDITMENU).length) {
                    if (!$scope.Utility.validate())
                        return false;
                    else
                        $scope.Utility.removeEditor();
                }

                var cloneMenu = $.extend(true, {}, $scope.menu);

                var data = $scope.Utility.prepareMenuData(cloneMenu);

                //if ($scope.Utility.hasDuplicateUrl(urls)) {
                //    alert("Duplicate url not allowed in menu configuration");
                //    return;
                //}

                var newAudit = $.extend(true, {}, $scope.menu);
                function auditDataHelper(auditObj) {
                    auditObj.AuditName = auditObj.title;
                    
                    (function iterate(childNodes) {
                        if (childNodes && childNodes.length)
                            $.each(childNodes, function (i, n) {
                                n.AuditName = n.title;
                                if(n.roles instanceof Array)
                                    $.each(n.roles, function (j, r) {
                                        r.AuditName = n.title + ' -> Role -> ' + r.Name;
                                        delete r['$$hashKey'];
                                    });

                                delete n['$$hashKey'];
                                if (n.ChildNodes && n.ChildNodes.length)
                                    iterate(n.ChildNodes);
                            });
                    })(auditObj.ChildNodes);

                    delete auditObj['$$hashKey'];
                    return auditObj;
                }
                
                $http.post(path + 'api/user/UpdateMenus', { menuConfig: data }, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {                    
                    Audit.log(Audit.Type.MENUCONFIG, $scope.Audit, newAudit, auditDataHelper).then(function () {
                        $.notify('Menu saved successfully', { position: 'top right', type: 'success' });
                    });
                }).error(function (error) {
                    $.notify('Unable to process your request. Please try again', { position: 'top right', type: 'error' });
                });
            };

            $scope.close = function () {
                window.location.href = path;
            };

            $scope.loadMenu = function () {

                $http.get(path + 'api/user/GetRoleForMenu', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                    $scope.Roles = data;
                    $http.get(path + 'api/Workflow/GetTaskTemplates', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (tdata) {
                        $scope.TaskTemplates = tdata;

                        var serviceUrl = path + 'api/user/GetMenus';
                        $http.get(serviceUrl, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (jdata) {

                            (function iterate(d) {
                                //roles
                                var roles = d.roles.split(",");

                                var objectRoles = [];
                                $.each($scope.Roles, function (i, r) {
                                    var obj = {};
                                    obj.Selected = $.inArray(r, roles) >= 0 ? true : false;
                                    obj.Name = r;
                                    objectRoles.push(obj);
                                });

                                ////gridconfig
                                //d.gridconfig = d.url.indexOf('PageID') >= 0 ? true : false;
                                d.roles = objectRoles;

                                //if (d.url.indexOf('&TaskName') > 0)
                                //    d.Task = d.url.split('&')[1].split('=')[1];
                                //else if (d.url.indexOf('?TaskName') > 0)
                                //    d.Task = d.url.split('?')[1].split('=')[1];

                                //if (!d.hasOwnProperty('visible')) {
                                //    d.visible = true;
                                //}
                                if (d.ChildNodes) {
                                    $.each(d.ChildNodes, function (i, d) {
                                        iterate(d);
                                    });
                                }
                            })(jdata);

                            $scope.menuTree = jdata;
                            $scope.menu = $.extend(true, {}, $scope.menuTree);

                            $scope.Audit = $.extend(true, {}, $scope.menuTree);
                        });

                    });
                });

            };
        }
    ]);
})(jQuery);