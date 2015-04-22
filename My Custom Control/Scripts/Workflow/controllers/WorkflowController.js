var APP = angular.module('WorkflowBuilder', ['glams.audit']);

APP.directive('onhandler', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            scope.initHandlers(scope.$eval(attrs.onhandler), elm);
        }
    };
});


APP.controller('WrokflowController', ['$scope', '$http', '$timeout', 'Audit', function ($scope, $http, $timeout, Audit) {
    $scope.GroupTypes = [];
    $scope.TaskTemplate = [];
    $scope.Workflow = {};
    $scope.Audit = {};
    $scope.Backup = {};
    $scope.Users = [];
    $scope.UsersInGroups = [];
    $scope.Groups = [];
    $scope.container = '#grouptaskdefaults';
    $scope.currentStage = null;

    var urlParam = window.location.href.split('/');
    $scope.ID = urlParam[urlParam.length - 1];

    $scope.StageSortHandler = function (event, ui) {
        var start = ui.item.data('start') - 1,
                    end = ui.item.index() - 1;
        console.log(start, end);
        $scope.Workflow.StageTemplates.splice(end, 0, $scope.Workflow.StageTemplates.splice(start, 1)[0]);
    };

    $scope.deleteStage = function (stageIndex) {
        $scope.Workflow.StageTemplates.splice(stageIndex, 1);
    };

    $scope.init = function () {
        $('.workflow').niceScroll({
            cursorborder: '#000',
            cursorcolor: '#048f99',
            cursorborderradius: '5px',
            cursorwidth: '5px'
        });

        ////property grid combobox fix
        //$(document).on('mousedown', '.combobox-item', function (e) {
        //    e.stopPropagation();
        //});

        $scope.screenResizeHandler();
        $(window).on('resize', $scope.screenResizeHandler);

        var loadInitialData = function () {

            $http.get(path + 'api/Workflow/GetGroups', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.Groups = data;
                //                $scope.$apply();
            });

            $http.get(path + 'api/Workflow/GetGroupTypes', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.GroupTypes = data;
                //                $scope.$apply();
            });

            $http.get(path + 'api/Workflow/GetUserInGroups', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.UsersInGroups = data;
                //                $scope.$apply();
            });

            $http.get(path + 'api/Workflow/GetUsers', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.Users = data;
                //                $scope.$apply();
            });

            $http.get(path + 'api/Workflow/GetTaskTemplates', { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.TaskTemplate = data;
                //                $scope.$apply();
            });

            $http.get(path + 'api/Workflow/GetWorkflow?ID=' + $scope.ID, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {

                $scope.Audit = $.extend(true, {}, data);

                for (var i = 0; i < data.StageTemplates.length; i++) {
                    data.StageTemplates[i].JsPlumb = jsPlumb.getInstance();
                    for (var j = 0; j < data.StageTemplates[i].Tasks.length; j++) {
                        data.StageTemplates[i].Tasks[j].Styles = JSON.parse(data.StageTemplates[i].Tasks[j].Styles);
                    }
                }

                $scope.Workflow = data;

                //$scope.$apply();
                $scope.currentStage = $scope.Workflow.StageTemplates[0];
                var stage = $scope.Workflow.StageTemplates[0];
                //selects first stage
                for (var i = 0; i < $scope.Workflow.StageTemplates.length; i++)
                    $scope.Workflow.StageTemplates[i].Selected = false;

                $timeout(function () {
                    stage.Selected = true;
                    $scope.currentStage = stage;
                }, 500);

            });

            $scope.$watch('TaskTemplate', function () {
                $('.activity-container').niceScroll({
                    cursorborder: '#000',
                    cursorcolor: '#048f99',
                    cursorborderradius: '5px',
                    cursorwidth: '5px'
                });
            }, true);

            $scope.$watch('GroupTypes', function () {
                $('.activity-container').niceScroll({
                    cursorborder: '#000',
                    cursorcolor: '#048f99',
                    cursorborderradius: '5px',
                    cursorwidth: '5px'
                });
            }, true);
        }();
    };

    $scope.initHandlers = function (handler, elm, index) {
        handler(elm, index);
    };

    $scope.initdrop = function (el) {
        $(el).droppable({
            accept: '.activity', drop: function (event, ui) {
                var left = event.pageX - $(el).parent().offset().left - 250;
                var top = event.pageY - $(el).parent().offset().top;
                var activity = JSON.parse($(ui.draggable).attr('data'));
                var type = $(ui.draggable).attr('type');

                var task = {};
                task.ID = uuid();
                task.Stage = $scope.currentStage.Name;
                task.TaskType = type;
                task.TaskTeamplateID = activity.ID;
                task.TaskTemplateName = activity.Name;
                task.GroupTypeID = 0;
                task.UrgID = '00000000-0000-0000-0000-000000000000';
                task.GroupID = '00000000-0000-0000-0000-000000000000';
                task.Duration = 0;
                task.ParentCount = 0;
                task.ParentCounter = 0;
                task.ChildCount = 0;
                task.ChildString = '';
                task.JobID = 0;
                task.ItemID = 0;
                task.Parents = [];
                task.Childrens = [];
                task.Styles = { 'left': left + 'px', 'top': top + 'px' };
                task.AutoFill = false;

                $scope.currentStage.Tasks.push(task);
                $scope.$apply();
            }
        });

        var stage = $scope.Workflow.StageTemplates[$(el).index() - 1];
        stage.JsPlumb.ready(function () {
            stage.JsPlumb.setRenderMode(jsPlumb.SVG);
            stage.JsPlumb.Defaults.Container = $(el);
            stage.JsPlumb.endpointClass = "endpointClass";
            stage.JsPlumb.connectorClass = "connectorClass";
            stage.JsPlumb.importDefaults({
                ConnectionsDetachable: true,
                ReattachConnections: true,
                DragOptions: {
                    cursor: 'pointer',
                    zIndex: 2000
                },
                ConnectorZIndex: 5
            });

            stage.JsPlumb.bind("click", function (conn, originalEvent) {
                var cNode = stage.Tasks[$(conn.target).parent().index()];
                var pNode = stage.Tasks[$(conn.source).parent().index()];

                cNode.Parents.splice(pNode.ID, 1);
                pNode.Childrens.splice(cNode.ID, 1);

                cNode.ParentCount = cNode.Parents.length;
                pNode.ChildCount = pNode.Childrens.length;

                stage.JsPlumb.detach(conn);
            });

            stage.JsPlumb.bind("connection", function (obj) {

                var duplicates = [];
                var array = function () {
                    var connections = stage.JsPlumb.getConnections();
                    for (var i = 0; i < connections.length; i++) {
                        if (connections[i].targetId == obj.connection.targetId && connections[i].sourceId == obj.connection.sourceId) {
                            duplicates.push(connections[i]);
                        }
                    }
                }();

                if (duplicates.length > 1) {
                    for (var i = 0; i < duplicates.length; i++) {
                        if (duplicates[i] == obj.connection) {
                            stage.JsPlumb.detach(obj.connection);
                            //alert('duplicate connections');
                            return;
                        }
                    }
                }

                if (obj.connection.targetId == obj.connection.sourceId) {
                    stage.JsPlumb.detach(obj.connection);
                } else {
                    var cNode = stage.Tasks[$(obj.target).parent().index()];
                    var pNode = stage.Tasks[$(obj.source).parent().index()];

                    if ($.inArray(pNode.ID, cNode.Parents) == -1)
                        cNode.Parents.push(pNode.ID);

                    if ($.inArray(cNode.ID, pNode.Childrens) == -1)
                        pNode.Childrens.push(cNode.ID);

                    cNode.ParentCount = cNode.Parents.length;
                    pNode.ChildCount = pNode.Childrens.length;
                }
            });
        });
    };

    $scope.initNode = function (el) {

        var node = $(el);
        var index = $(el).index();

        $scope.currentStage = $scope.Workflow.StageTemplates[$(el).parent().index() - 1];

        function GetObject(obj, id) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].ID == id)
                    return obj[i];
            }
        }

        $(node).keyup(function (e) {
            switch (e.which) {
                case 173:
                case 109:
                case 46:
                    $scope.deleteNode(node);
                    break;
                case 61:
                case 107:
                    $scope.cloneNode(node);
                    break;
            }
        });

        node.prop('id', $scope.currentStage.Tasks[index].ID);

        node = $scope.attachJsPlumb(node, $scope.currentStage);

        $scope.currentStage.Tasks[index].ID = node.attr('id');

        if (index == $scope.currentStage.Tasks.length - 1) {

            var hasLinked = false;

            for (var i = 0; i < $scope.currentStage.Tasks.length; i++) {
                if ($scope.currentStage.Tasks[i].Parents != null) {
                    for (var j = 0; j < $scope.currentStage.Tasks[i].Parents.length; j++) {
                        hasLinked = true;
                        var current = GetObject($scope.currentStage.Tasks, $scope.currentStage.Tasks[i].ID);
                        var parent = GetObject($scope.currentStage.Tasks, $scope.currentStage.Tasks[i].Parents[j]);
                        if (parent)
                            $scope.connect($scope.currentStage, parent.ID, current.ID);
                    }
                }
            }

            if (hasLinked && $scope.JsPlumb) $scope.JsPlumb.repaintEverything();
        }

        return node;
    };

    $scope.addstage = function (stageIndex) {
        $(".stage-tab li").focus();
        if (lookupindex($scope.Workflow.StageTemplates, 'Name', 'Untitled') == -1) {
            var obj = {};
            obj.ID = uuid();
            obj.Name = 'Untitled';
            obj.Selected = false;
            obj.JsPlumb = jsPlumb.getInstance();
            obj.Tasks = [];
            $scope.Workflow.StageTemplates.splice(stageIndex + 1, 0, obj);
        }
    };

    $scope.screenResizeHandler = function () {
        var w = $(window).width();
        var h = $(window).height();

        var nH = (h - $('header').height() - $('footer').height());
        $('[resizeH]').height(nH);
    };

    $scope.attachJsPlumb = function (node) {
        $scope.currentStage.JsPlumb.makeSource($(node).find('.text'), sourceNodeOption);
        $scope.currentStage.JsPlumb.makeTarget($(node).find('.text'), targetNodeOption);
        $scope.currentStage.JsPlumb.draggable(node, {
            containment: [250, 50, 'auto', 'auto'],
            handle: '.handler',
            drag: function () {
                var index = $(node).index();
                $scope.currentStage.Tasks[index].Styles = { left: $(node).css('left'), top: $(node).css('top') };
                //scope.plumbObj.repaintEverything();
            },
            stop: function (event, ui) {
                $('.workflow').getNiceScroll().resize();
            }
        });
        return node;
    };

    $scope.showProperty = function (event) {
        var index = $(event.currentTarget).index();
        $(event.currentTarget).focus();
        if ($scope.$$childHead)
            $scope.$$childHead.showProperty(index, $scope);
    };

    $scope.cloneNode = function (e) {
        var element = ($(e.target).closest('.node').length == 0) ? e : $(e.target).closest('.node');

        var left = $(element).offset().left - $(element).parent().offset().left + 20;
        var top = $(element).offset().top - $(element).parent().offset().top + 20;

        var node = $scope.currentStage.Tasks[element.index()];

        var task = {};
        task.ID = uuid();
        task.Stage = $scope.currentStage.Name;
        task.TaskType = node.TaskType;
        task.TaskTeamplateID = node.TaskTeamplateID;
        task.TaskTemplateName = node.TaskTemplateName;
        task.UrgID = '00000000-0000-0000-0000-000000000000';
        task.GroupID = '00000000-0000-0000-0000-000000000000';
        task.Duration = 0;
        task.ParentCount = 0;
        task.ParentCounter = 0;
        task.ChildCount = 0;
        task.ChildString = '';
        task.JobID = 0;
        task.ItemID = 0;
        task.Parents = [];
        task.Childrens = [];
        task.AutoFill = false;
        task.Styles = { 'left': left + 'px', 'top': top + 'px' };

        $scope.currentStage.Tasks.push(task);
    };

    $scope.deleteNode = function (e) {
        var element = ($(e.target).closest('.node').length == 0) ? e : $(e.target).closest('.node');
        var nodeIndex = element.index();

        $scope.currentStage.JsPlumb.detachAllConnections(element.find('.text'));

        $scope.currentStage.Tasks.splice(nodeIndex, 1);
        //$($scope.propertyContainer).propertygrid('loadData', []);
        $scope.$apply();
    };

    $scope.connect = function (scope, sourceId, targetId) {
        scope.JsPlumb.connect({
            source: $('#' + sourceId).find('.text'),
            target: $('#' + targetId).find('.text'),
            anchor: ['BottomCenter', 'TopCenter'],
            connector: "Flowchart",
            overlays: [
                ["Arrow", {
                    width: 10,
                    length: 10,
                    location: 1
                }]
            ],
        });
    };

    $scope.attachblur = function (el) {
        $(el).blur(function () {
            var stage = $scope.Workflow.StageTemplates[$(this).parent().index() - 1];
            stage.Name = $(this).text();
        });
    };

    $scope.selectTab = function (event) {

        var stage = null;
        var srcElm = $(event.target).is('li') ? $(event.target).is('li') : $(event.target).closest('li');

        stage = $scope.Workflow.StageTemplates[srcElm.index() - 1];

        for (var i = 0; i < $scope.Workflow.StageTemplates.length; i++)
            $scope.Workflow.StageTemplates[i].Selected = false;

        stage.Selected = true;
        $scope.currentStage = stage;
        $timeout($scope.currentStage.JsPlumb.repaintEverything, 10);
    };

    $scope.initStageSortable = function () {
        $(document).on('click', ".stage-tab li span", function () {
            $(this).focus();
        });
        $('.stage-tab').sortable({
            items: "li:not(:first-child)",
            start: function (event, ui) {
                ui.item.data('start', ui.item.index());
            },
            update: $scope.StageSortHandler
        });
    };

    $scope.refreshStageSortable = function () {
        $(".stage-tab").sortable("refresh");
    };

    $scope.isStageNameEditable = function (stage) {
        if (typeof stage.ID == "string")
            return true;
        return false;
    };

    $scope.save = function () {

        if ($scope.$$childHead)
            $scope.$$childHead.updateData();

        $.extend(true, $scope.Backup, $scope.Workflow);
        $scope.Backup.ID = +$scope.ID;

        for (var i = 0; i < $scope.Backup.StageTemplates.length; i++) {
            if ($scope.Backup.StageTemplates[i].ID.length > 1)
                $scope.Backup.StageTemplates[i].ID = 0;

            //$scope.Backup.StageTemplates[i].ID = i;
            $scope.Backup.StageTemplates[i].JsPlumb = '';
            for (var j = 0; j < $scope.Backup.StageTemplates[i].Tasks.length; j++)
                $scope.Backup.StageTemplates[i].Tasks[j].Styles = JSON.stringify($scope.Backup.StageTemplates[i].Tasks[j].Styles);
        }

        var newAudit = $.extend(true, {}, $scope.Backup);


        function auditDataHelper(r) {

            for (var i = 0; i < r.StageTemplates.length; i++) {

                if (r.StageTemplates[i]) {

                    r.StageTemplates[i].AuditName = "Workflow(" + r.Name + ") -> Stage(" + r.StageTemplates[i].Name + ")";

                    for (var j = 0; j < r.StageTemplates[i].Tasks.length; j++) {
                        if (r.StageTemplates[i].Tasks[j]) {
                            r.StageTemplates[i].Tasks[j].AuditName = r.StageTemplates[i].AuditName + " -> Task(" + r.StageTemplates[i].Tasks[j].TaskTemplateName + ")";
                            r.StageTemplates[i].Tasks[j]['$$hashKey'] && (delete r.StageTemplates[i].Tasks[j]['$$hashKey']);
                        }
                    }

                    r.StageTemplates[i]['$$hashKey'] && (delete r.StageTemplates[i]['$$hashKey']);
                }
            }
            
            r.AuditName = r.Name;
            r['$$hashKey'] && (delete r['$$hashKey']);

            return r;
        };

        $http.post(path + 'api/Workflow/UpdateWorkflow', $scope.Backup, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
            Audit.log(Audit.Type.WORKFLOW, $scope.Audit, newAudit, auditDataHelper).then(function () {
                $scope.Audit = newAudit;
                $.notify('Workflow saved successfully', { position: 'bottom right', type: 'success' });
            });
        }).error(function (error) {
            alert('invalid configuration fill all requried fields');
        });
    };

    $scope.close = function () {
        window.parent.glams.modal.getAll()[0].close();
    };
}
]);

APP.controller('PropertyController', ['$scope', '$http', function ($scope, $http) {
    $scope.title = "";
    $scope.currentScope = null;
    $scope.elementIndex = -1;
    $scope.container = null;
    $scope.node = null;

    $scope.$watch('title', function (nv, ov) {
        $scope.title = nv;
    });

    $scope.toggle = function (e) {
        $(e.target).parent().next().slideToggle();
    }

    $scope.init = function () {
        $scope.container = $('#' + $scope.gridid);
        $scope.container.parents().find('.property-container').show();
    };

    $scope.updateData = function () {
        if (!$scope.container || !$scope.node)
            return;
        var obj = $scope.container.jqPropertyGrid('get');

        if (obj) {

            if (lookupindex($scope.currentScope.Groups, 'Name', obj.Groups) > -1) {
                var group = lookup($scope.currentScope.Groups, 'Name', obj.Groups)
                $scope.node.GroupID = group.GroupID;
            } else $scope.node.GroupID = '00000000-0000-0000-0000-000000000000';

            if (lookupindex($scope.currentScope.GroupTypes, 'Name', obj.GroupTypes) > -1) {
                var groupType = lookup($scope.currentScope.GroupTypes, 'Name', obj.GroupTypes)
                $scope.node.GroupTypeID = groupType.ID;
            }

            if (lookupindex($scope.currentScope.Users, 'm_Item1', obj.Users) > -1) {
                var user = lookup($scope.currentScope.Users, 'm_Item1', obj.Users)
                $scope.node.UrgID = user.m_Item2;
            } else $scope.node.UrgID = '00000000-0000-0000-0000-000000000000';


            $scope.node.AutoFill = obj.AutoFill;
            $scope.node.Duration = obj.Duration;
        }
    };

    $scope.showProperty = function (index, scope) {
        $scope.currentScope = scope;
        $scope.elementIndex = index;
        $scope.init();
        $scope.loadData();
    };

    $scope.loadData = function () {

        $scope.updateData();

        var setObj = {};
        var metaObj = {};
        var node = $scope.currentScope.currentStage.Tasks[$scope.elementIndex];
        var rows = [];

        $scope.node = node;

        if (node.TaskType == 'task') {
            var groupType = null;
            var group = null;

            if (lookupindex($scope.currentScope.Groups, 'GroupID', node.GroupID) > -1) {
                var group = lookup($scope.currentScope.Groups, 'GroupID', node.GroupID);
            }

            if (lookupindex($scope.currentScope.GroupTypes, 'ID', node.GroupTypeID) > -1) {
                var groupType = lookup($scope.currentScope.GroupTypes, 'ID', node.GroupTypeID);
            }

            function GetGroups(array) {
                var items = [];
                items.push('');
                for (var i = 0; i < array.length; i++) {
                    var item = {};
                    item.value = array[i].Name;
                    item.text = array[i].Name;
                    items.push(item);
                }
                return items;
            }

            function GetUsers() {
                var users = [];
                users.push('');
                if (group && group.ID > -1) {
                    var usersInGroups = lookuparray($scope.currentScope.UsersInGroups, 'GroupId', group.GroupID);
                    for (var i = 0; i < $scope.currentScope.Users.length; i++) {
                        if (lookupindex(usersInGroups, 'UserId', $scope.currentScope.Users[i].m_Item2) > -1) {
                            var item = {};
                            item.value = $scope.currentScope.Users[i].m_Item1;
                            item.text = $scope.currentScope.Users[i].m_Item1;
                            users.push(item);
                        }
                    }
                }

                return users;
            }

            var SetGroupTypes = function () {
                setObj["GroupTypes"] = (groupType) ? groupType.Name : '';
                var mO = {};
                mO.type = 'options',
                mO.options = GetGroups($scope.currentScope.GroupTypes);
                metaObj["GroupTypes"] = mO;
            }();
            var SetGroups = function () {
                setObj["Groups"] = (group) ? group.Name : '';
                var mO = {};
                mO.type = 'options',
                mO.options = GetGroups((groupType) ? lookuparray($scope.currentScope.Groups, 'FK_MasterListID', groupType.ID) : []);
                metaObj["Groups"] = mO;
            }();
            var SetUsers = function () {
                var user = (lookupindex($scope.currentScope.Users, 'm_Item2', node.UrgID) > -1) ? lookup($scope.currentScope.Users, 'm_Item2', node.UrgID) : null;
                setObj["Users"] = (user) ? user.m_Item1 : '';
                var mO = {};
                mO.type = 'options',
                mO.options = GetUsers();
                metaObj["Users"] = mO;
            }();
            var SetDuration = function () {
                setObj["Duration"] = node.Duration;
                var mO = {};
                mO.type = 'number';
                mO.options = { min: 0, step: 1 };
                metaObj["Duration"] = mO;
            }();
            var SetAutoFill = function () {
                setObj["AutoFill"] = node.AutoFill;
                var mO = {};
                mO.type = 'boolean';
                metaObj["AutoFill"] = mO;
            }();
        }

        function changeHandler() {

            $scope.container.jqPropertyGrid(setObj, metaObj);

            $scope.container.find('select').eq(0).on('change', function () {
                groupType = lookup($scope.currentScope.GroupTypes, 'Name', this.value);
                metaObj["Groups"].options = GetGroups((groupType) ? lookuparray($scope.currentScope.Groups, 'FK_MasterListID', groupType.ID) : []);
                setObj["GroupTypes"] = this.value;
                changeHandler();
            });

            $scope.container.find('select').eq(1).on('change', function () {
                group = lookup($scope.currentScope.Groups, 'Name', this.value);
                metaObj["Users"].options = GetUsers();
                setObj["Groups"] = this.value;
                changeHandler();
            });
        }

        changeHandler();

    };
}]);