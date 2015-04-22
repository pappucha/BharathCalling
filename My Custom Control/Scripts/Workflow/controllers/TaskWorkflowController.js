var APP = angular.module('TaskTemplate', ['glams.audit']);
var ACTIVITY_CONTAINTER = '.activity-container';
var TEMPLATE_CONTAINER = '.template-container';
var ACTIVITY = '.activity';
var TEMPLATE = '.template';
APP.controller('TaskWorkflowController', ['$scope', '$http', '$timeout','Audit',
    function ($scope, $http, $timeout, Audit) {
        $scope.inFlow = [];
        $scope.outFlow = [];
        $scope.Audit = {};
        $scope.Backup = {};
        $scope.active = false;
        $scope.formProperties = [];
        $scope.taskTemplate = [];
        $scope.Activities = [];
        $scope.existingTemplates = [];

        var urlParam = window.location.href.split('/');
        $scope.ID = urlParam[urlParam.length - 1];

        $scope.data = {
            TemplateID: $scope.ID,
            TaskName: '',
            UserId: '',
            LayoutID: 0,
            UserControl: '',
            Inflow: [],
            Outflow: []
        };

        $scope.loadActivities = function () {
            var ActivityServiceUrl = path + "api/Workflow/GetActivities";
            $http.get(ActivityServiceUrl, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.Activities = data;
                $(ACTIVITY_CONTAINTER).niceScroll({
                    cursorborder: '#000',
                    cursorcolor: '#048f99',
                    cursorborderradius: '5px',
                    cursorwidth: '5px'
                });
            });
        };

        $scope.loadExistingTemplates = function () {
            var existingTemplatesServiceUrl = path + "api/Workflow/GetTaskTemplates";
            $http.get(existingTemplatesServiceUrl, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                $scope.existingTemplates = data;
                $(TEMPLATE_CONTAINER).niceScroll({
                    cursorborder: '#000',
                    cursorcolor: '#048f99',
                    cursorborderradius: '5px',
                    cursorwidth: '5px'
                });
            });
        };

        $scope.loadData = function (id, isDropped) {
            var TaskTemplatServiceUrl = path + 'api/Workflow/GetTaskTemplate?id=' + id;
            $http.get(TaskTemplatServiceUrl, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {

                var task = JSON.parse(data.TaskTemplate);
                var fromProperties = JSON.parse(data.FromProperties);
                var template = JSON.parse(data.Template);

                if (!isDropped)
                    $scope.data.TemplateID = task.ID;

                $scope.data.TaskName = task.Name;
                $scope.data.LayoutID = task.LayoutID;
                $scope.data.UserControl = task.UserControl;
                $scope.data.UserId = task.UpdatedBy;
                $scope.formProperties = fromProperties;
                $scope.taskTemplate = template;                
                $scope.setData(template);
                $scope.Audit = $.extend(true, {}, template);
            });
        };

        $scope.init = function () {
            $scope.loadActivities();
            $scope.loadExistingTemplates();
            $('.workflow').niceScroll({
                cursorborder: '#000',
                cursorcolor: '#048f99',
                cursorborderradius: '5px',
                cursorwidth: '5px'
            });

            $scope.screenResizeHandler();
            $(window).on('resize', $scope.screenResizeHandler);

            if (+$scope.ID > 0)
                $scope.loadData($scope.ID);
        };

        $scope.screenResizeHandler = function () {
            var w = $(window).width();
            var h = $(window).height();

            var nH = (h - $('header').height() - $('footer').height());
            $('[resizeH]').height(nH);
        };

        $scope.selectTab = function (flag) {
            $scope.active = flag;
            if (flag) {
                $scope.inFlow.selectTab();
            } else {
                $scope.outFlow.selectTab();
            }
        };

        $scope.getData = function () {
            $scope.data.Inflow = $scope.inFlow.getData();
            $scope.data.Outflow = $scope.outFlow.getData();

            $.extend(true, $scope.Backup, $scope.data);

            return $scope.Backup;
        };

        $scope.setData = function (data) {
            $scope.inFlow.setData(data.Inflow);
            $scope.outFlow.setData(data.Outflow);
            $scope.selectTab(false);
        };

        $scope.initPlumb = function (scope) {
            $(scope.container).droppable({
                accept: '.activity, .template',
                drop: scope.dropHandler
            });

            scope.plumbObj.ready(function () {
                scope.plumbObj.setRenderMode(jsPlumb.SVG);
                scope.plumbObj.Defaults.Container = $(scope.container);
                scope.plumbObj.endpointClass = "endpointClass";
                scope.plumbObj.connectorClass = "connectorClass";
                scope.plumbObj.importDefaults({
                    ConnectionsDetachable: true,
                    ReattachConnections: true,
                    DragOptions: {
                        cursor: 'pointer',
                        zIndex: 2000
                    },
                    ConnectorZIndex: 5
                });

                scope.plumbObj.bind("click", function (conn, originalEvent) {
                    var cNode = scope.data[$(conn.target).parent().index()];
                    var pNode = scope.data[$(conn.source).parent().index()];
                    cNode.Parents.splice(pNode.ID, 1);
                    scope.plumbObj.detach(conn);
                    $(document).trigger('mousedown');
                });

                scope.plumbObj.bind("connection", function (obj) {

                    var duplicates = [];
                    var array = function () {
                        var connections = scope.plumbObj.getConnections();
                        for (var i = 0; i < connections.length; i++) {
                            if (connections[i].targetId == obj.connection.targetId && connections[i].sourceId == obj.connection.sourceId) {
                                duplicates.push(connections[i]);
                            }
                        }
                    }();

                    if (duplicates.length > 1) {
                        for (var i = 0; i < duplicates.length; i++) {
                            if (duplicates[i] == obj.connection) {
                                scope.plumbObj.detach(obj.connection);
                                return;
                            }
                        }
                    }

                    if (obj.connection.targetId == obj.connection.sourceId) {
                        scope.plumbObj.detach(obj.connection);
                    } else {
                        var cNode = scope.data[$(obj.connection.target).parent().index()];
                        var pNode = scope.data[$(obj.connection.source).parent().index()];
                        if ($.inArray(pNode.ID, cNode.Parents) == -1)
                            cNode.Parents.push(pNode.ID);
                    }
                });
            });
        };

        $scope.dropHandler = function (event, ui, scope) {

            if (ui.draggable.is(ACTIVITY)) {
                $scope.activityDropped(event, ui, scope);
            }
            else {
                $scope.templateDropped(event, ui, scope);
            }
        };

        $scope.templateDropped = function (event, ui, scope) {
            if (confirm('!Warning: Existing data will be replaced.\n Are you sure want to continue?')) {
                var index = ui.draggable.index();
                var template = $scope.existingTemplates[index];
                $scope.loadData(template.ID, true);
                $scope.selectTab(false);
            }
        };

        $scope.activityDropped = function (event, ui, scope) {
            var left = event.pageX - $(scope.container).parent().offset().left - 250;
            var top = event.pageY - $(scope.container).parent().offset().top;
            var index = ui.draggable.index();
            var activity = $scope.Activities[index];

            var obj = {};

            obj.ID = ID();
            obj.Name = activity.Name;
            obj.Style = {
                'left': left + 'px',
                'top': top + 'px'
            };
            obj.Data = JSON.parse(activity.Data);
            obj.Mapping = activity.Mapping ? JSON.parse(activity.Mapping) : JSON.parse(activity.Data);
            obj.Parents = [];

            scope.data.push(obj);
            try {
                $scope.$apply();
            } catch (e) { }
        };

        $scope.initNode = function (index, scope) {

            function GetObject(obj, id) {
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i].ID == id)
                        return obj[i];
                }
            }

            var node = $(scope.container).find('.node').eq(index);

            $(node).keyup(function (e) {
                switch (e.which) {
                    case 173:
                    case 109:
                    case 46:
                        $scope.deleteNode(node, scope);
                        $scope.$apply();
                        break;
                    case 61:
                    case 107:
                        $scope.cloneNode(node, scope);
                        $scope.$apply();
                        break;
                }
            });


            node.prop('id', scope.data[index].ID);

            node = $scope.attachJsPlumb(node, scope);

            scope.data[index].ID = node.attr('id');

            if (index == scope.data.length - 1) {

                var hasLinked = false;

                for (var i = 0; i < scope.data.length; i++) {
                    for (var j = 0; j < scope.data[i].Parents.length; j++) {
                        hasLinked = true;
                        var current = GetObject(scope.data, scope.data[i].ID);
                        var parent = GetObject(scope.data, scope.data[i].Parents[j]);
                        if (parent)
                            $scope.connect(scope, parent.ID, current.ID);
                    }
                }

                if (hasLinked)
                    scope.plumbObj.repaintEverything();
            }

            return node;
        };

        $scope.attachJsPlumb = function (node, scope) {
            scope.plumbObj.makeSource($(node).find('.text'), sourceNodeOption);
            scope.plumbObj.makeTarget($(node).find('.text'), targetNodeOption);
            scope.plumbObj.draggable(node, {
                containment: [250, 50, 'auto', 'auto'],
                handle: '.handler',
                drag: function () {
                    var index = $(node).index();
                    scope.data[index].Style = {
                        left: $(node).css('left'),
                        top: $(node).css('top')
                    };
                    scope.plumbObj.repaintEverything();
                },
                stop: function (event, ui) {
                    $('.workflow').getNiceScroll().resize();
                }
            });
            return node;
        };

        $scope.cloneNode = function (el, scope) {
            var index = $(el).index();
            var left = $(el).offset().left - $(el).parent().offset().left + 20;
            var top = $(el).offset().top - $(el).parent().offset().top + 20;
            var sdata = $.extend(true, {}, scope.data[index]);
            var obj = {};
            obj.ID = ID();
            obj.Name = sdata.Name
            obj.Style = {
                'left': left + 'px',
                'top': top + 'px'
            };
            obj.Data = sdata.Data;
            obj.Mapping = sdata.Mapping;
            obj.Parents = [];

            scope.data.push(obj);
        };

        $scope.deleteNode = function (el, scope) {
            var elm = $(el).find('.text');
            var index = $(el).index();
            scope.plumbObj.detachAllConnections(elm);
            scope.data.splice(index, 1);
        };

        $scope.populateData = function (scope, data) {
            scope.data = data;
        };

        $scope.connect = function (scope, sourceId, targetId) {
            scope.plumbObj.connect({
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
            scope.plumbObj.repaintEverything();
        };

        $scope.save = function () {
            //$('.workflow.active .node').eq(0).trigger('click');

            var newAudit = $.extend(true, {}, $scope.getData());

            function frameDataMapping(oArray, r) {
                for (var i = 0; i < oArray.length; i++) {
                    var activity = oArray[i];
                    activity['$$hashKey'] && (delete activity['$$hashKey']);
                    activity.AuditName = "Task -> (" + r.TaskName + ") -> Activity -> (" + activity.Name + ")";

                    for (var j = 0; j < activity.Data.length; j++) {
                        var aData = activity.Data[j];
                        aData.AuditName = activity.AuditName + "Property Name -> (" + aData.Name + ")";
                        aData.Value = (aData.Value == "True") ? true : (aData.Value == "False") ? false : aData.Value;
                    }

                    for (var j = 0; j < activity.Mapping.length; j++) {
                        var aData = activity.Mapping[j];
                        aData.AuditName = activity.AuditName + "Form Property Name -> (" + aData.Name + ")";
                        aData.Value = (aData.Value == "True") ? true : (aData.Value == "False") ? false : aData.Value;
                    }

                    delete activity["Parents"];
                    delete activity['Style'];
                }

                return oArray;
            }

            function auditDataHelper(r) {
               
                frameDataMapping(r.Inflow, r);
                frameDataMapping(r.Outflow, r);

                r.AuditName = r.TaskName;
                delete r['$$hashKey'];
                delete r['UserControl'];
                return r;
            };

            $http.post(path + 'api/Workflow/UpdateTaskTemplate', $scope.getData(), { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                Audit.log(Audit.Type.TASK, $scope.Audit, newAudit, auditDataHelper).then(function () {
                    $scope.Audit = newAudit;
                    $.notify('TaskTemplate saved successfully', { position: 'bottom right', type: 'success' });
                });
            });
        };

        $scope.close = function () {
            window.parent.glams.modal.getAll()[0].close();
        };
    }
]);

APP.controller('InFlowController', ['$scope', '$http', '$timeout',
    function ($scope, $http, $timeout) {
        $scope.plumbObj = {};
        $scope.container = '#inflow';
        $scope.data = [];

        $scope.init = function () {
            $scope.$parent.inFlow = $scope;
            $scope.plumbObj = jsPlumb.getInstance();
            $scope.$parent.initPlumb($scope);
        };

        $scope.getData = function () {
            $scope.$$childHead.updateData();
            return $scope.data;
        };

        $scope.setData = function (data) {
            $scope.plumbObj.detachEveryConnection();
            $scope.$parent.populateData($scope, data);
            $scope.selectTab();
        };

        $scope.selectTab = function () {
            $timeout(function () {
                for (var i = 0; i < 30; i++)
                    $scope.plumbObj.repaintEverything();
            }, 100);
            $timeout(function () {
                for (var i = 0; i < 30; i++)
                    $scope.plumbObj.repaintEverything();
            }, 200);
        };

        $scope.showProperty = function (event) {
            var index = $(event.currentTarget).index();
            $(event.currentTarget).focus();
            if ($scope.$$childHead)
                $scope.$$childHead.showProperty(index, $scope);
        };

        $scope.dropHandler = function (event, ui) {
            $scope.$parent.dropHandler(event, ui, $scope);
        };

        $scope.initNode = function (index) {
            $scope.$parent.initNode(index, $scope);
        };

        $scope.cloneNode = function (event) {
            event.stopPropagation();
            var elm = $(event.currentTarget).parents('.node');
            $scope.$parent.cloneNode(elm, $scope);
        }

        $scope.deleteNode = function (event) {
            event.stopPropagation();
            var elm = $(event.currentTarget).parents('.node');
            $scope.$parent.deleteNode(elm, $scope);
        };
    }]);

APP.controller('OutFlowController', ['$scope', '$http', '$timeout',
    function ($scope, $http, $timeout) {
        $scope.plumbObj = {};
        $scope.container = '#outflow';
        $scope.data = [];

        $scope.init = function () {
            $scope.$parent.outFlow = $scope;
            $scope.plumbObj = jsPlumb.getInstance();
            $scope.$parent.initPlumb($scope);
        };

        $scope.getData = function () {
            $scope.$$childHead.updateData();
            $scope.$$childHead.$$nextSibling.updateFormMapping();
            return $scope.data;
        };

        $scope.setData = function (data) {
            $scope.plumbObj.detachEveryConnection();
            $scope.$parent.populateData($scope, data);
            $scope.selectTab();
        };

        $scope.selectTab = function () {
            $timeout(function () {
                for (var i = 0; i < 30; i++)
                    $scope.plumbObj.repaintEverything();
            }, 100);
            $timeout(function () {
                for (var i = 0; i < 30; i++)
                    $scope.plumbObj.repaintEverything();
            }, 200);
        };

        $scope.showProperty = function (event) {
            var index = $(event.currentTarget).index();
            $(event.currentTarget).focus();
            $scope.$$childHead.showProperty(index, $scope);
            $scope.$$childHead.$$nextSibling.showProperty(index, $scope, true);
        };

        $scope.dropHandler = function (event, ui) {
            $scope.$parent.dropHandler(event, ui, $scope);
        };

        $scope.initNode = function (index) {
            $scope.$parent.initNode(index, $scope);
            $scope.plumbObj.repaintEverything();
        };

        $scope.cloneNode = function (event) {
            event.stopPropagation();
            var elm = $(event.currentTarget).parents('.node');
            $scope.$parent.cloneNode(elm, $scope);
        }

        $scope.deleteNode = function (event) {
            event.stopPropagation();
            var elm = $(event.currentTarget).parents('.node');
            $scope.$parent.deleteNode(elm, $scope);
        }

    }]);

APP.controller('PropertyController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.title = "";

        $scope.currentScope = null;

        $scope.elementIndex = -1;

        $scope.$watch('title', function (nv, ov) {
            $scope.title = nv;
        });

        $scope.container = null;

        $scope.toggle = function (e) {
            $(e.target).parent().next().slideToggle();
        }

        $scope.init = function (formMapping) {
            $scope.container = $('#' + $scope.gridid);
            $scope.container.parents().find('.property-container').show();
        };

        $scope.updateData = function () {
            if (!$scope.container || !$scope.currentScope.data[$scope.elementIndex])
                return;
            var obj = $scope.container.jqPropertyGrid('get');
            var arr = $scope.currentScope.data[$scope.elementIndex].Data;
            for (var i = 0; i < arr.length; i++) {
                arr[i].Value = obj[arr[i].Name];
            }
        };

        $scope.updateFormMapping = function () {
            if (!$scope.container || !$scope.currentScope.data[$scope.elementIndex])
                return;
            var obj = $scope.container.jqPropertyGrid('get');
            var arr = $scope.currentScope.data[$scope.elementIndex].Mapping;
            for (var i = 0; i < arr.length; i++) {
                arr[i].Value = obj[arr[i].Name];
            }
        };

        $scope.showProperty = function (index, scope, formMapping) {
            if (formMapping) {
                $scope.updateFormMapping();
            } else {
                $scope.updateData();
            }

            $scope.currentScope = scope;
            $scope.elementIndex = index;
            $scope.init(formMapping);

            if (formMapping) {
                $scope.formMappingData();
            } else {
                $scope.loadData();
            }
        };

        $scope.formMappingData = function () {
            var setObj = {};
            var metaObj = {};
            var data = $scope.currentScope.data[$scope.elementIndex].Mapping;

            for (var i = 0; i < data.length; i++) {
                setObj[data[i].Name] = data[i].Value == null ? '' : data[i].Value;
                var mO = {};
                mO.type = 'options';
                mO.options = $scope.buildFormMappingData(i);
                metaObj[data[i].Name] = mO;
            }
            $scope.container.jqPropertyGrid(setObj, metaObj);
            function changeHanler() {
                var cnt = 0;
                for(m in metaObj){
                    if (cnt > 0) {
                        metaObj[m].options = $scope.buildFormMappingData(cnt, this.value);
                        setObj[m] = '';
                    }
                    else
                        setObj[m] = this.value;
                    cnt++;
                }
                $scope.container.jqPropertyGrid(setObj, metaObj);
                $scope.container.find('select').eq(0).on('change', changeHanler);
            }

            $scope.container.find('select').eq(0).on('change', changeHanler);
        };

        $scope.buildFormMappingData = function (index, formName) {

            var arrayData = [];
            var items = [];
            var selectedIndex = lookupindex($scope.$parent.$parent.formProperties, 'Name', formName || $scope.currentScope.data[$scope.elementIndex].Mapping[0].Value);

            if (selectedIndex == -1) selectedIndex = 0;

            function AddCombo(tItm) {
                var tItems = [];
                tItems.push("");
                for (var j = 0; j < tItm.length; j++) {
                    var item = {};
                    item.value = tItm[j];
                    item.text = tItm[j];
                    tItems.push(item);
                }
                return tItems;
            }
            try {
                $.extend(true, items, $scope.$parent.$parent.formProperties[selectedIndex].Controls);
            } catch (e) { }

            if (index == 0) {
                (function () {
                    arrayData.push("");
                    for (var i = 0; i < $scope.$parent.$parent.formProperties.length; i++) {
                        var item = {};
                        item.value = $scope.$parent.$parent.formProperties[i].Name;
                        item.text = $scope.$parent.$parent.formProperties[i].Name;
                        arrayData.push(item);
                    }
                })();

                return arrayData;
            }

            return AddCombo(items);
        }

        $scope.loadData = function () {
            var setObj = {};
            var metaObj = {};
            var data = $scope.currentScope.data[$scope.elementIndex].Data;
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].Value);
                setObj[data[i].Name] = data[i].Value == null ? '' : data[i].Value;
                var mO = {};
                switch (data[i].Editor) {
                    case 'combobox':
                        mO.type = 'options',
                        console.log(data[i].DataUrl);
                        $.ajax({
                            url: path + data[i].DataUrl,
                            type: 'GET',
                            async:false,
                            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
                        }).done(function (data) {
                            mO.options = data;
                        });
                        break;
                    case 'checkbox':
                        mO.type = 'boolean';
                        setObj[data[i].Name] = (setObj[data[i].Name] == 'True' || setObj[data[i].Name] == 'true' || setObj[data[i].Name] == true) ? true : false;
                        break;

                }
                metaObj[data[i].Name] = mO;
                
            }
            $scope.container.jqPropertyGrid(setObj, metaObj);
        };
    }]);