/*Sortable*/
APP.directive('sortable', function ($document) {
    return function (scope, element, attrs) {
        $(element).sortable({
            handle: '.sort-handler',
            start: function (event, ui) {
                ui.item.data('start', ui.item.index());
            },
            update: $(element).parents('#ColumnSettings').length ? scope.ColumnOptions.SortHandler : scope.StageOptions.SortHandler
        });
    };
});


//attach nicescroll to element
APP.directive('scrollable', function ($document) {
    return function (scope, element, attrs) {
        $(element).niceScroll({
            cursorborder: '#000',
            cursorcolor: '#048f99',
            cursorborderradius: '5px',
            cursorwidth: '5px',
            spacebarenabled: false,
            enablekeyboard: false
        });
    };
});


//ResizeX
APP.directive('xresize', function ($document) {
    return function (scope, element, attrs) {
        angular.element(window).resize(function () {
            var tW = 0;
            try {
                tW = +eval(attrs.xresize);
            } catch (e) {
                tW = 0;
            }
            $(element).width($(window).width() - (tW ? tW : 0));
        }).resize();
    };
});

//ResizeY
APP.directive('yresize', function ($document) {
    return function (scope, element, attrs) {
        angular.element(window).resize(function () {
            var tH = 0;
            try {
                tH = +eval(attrs.yresize);
            } catch (e) {
                tH = 0;
            }
            $(element).height($(window).height() - (tH ? tH : 0));
        }).resize();
    };
});

/*Tabs*/
APP.directive('tabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: ["$scope",
            function ($scope) {
                var panes = $scope.panes = [];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                    setTimeout(function () {
                        $('[scrollable]').getNiceScroll().resize();
                    },300);
                };

                this.addPane = function (pane) {                    
                    if (panes.length == 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                }

            }],
        template: '<div class="tabs">' +
            '<ul class="tabs-head clearfix">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" ng-click="select(pane)">{{pane.title}}</li>' +
            '</ul>' +
            '<div class="tab-content" yresize="160" ng-transclude></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('pane', function () {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',
        replace: true
    };
});


/*Tabs*/
APP.directive('grouppanel', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: ["$scope",
            function ($scope) {
                $scope.toggleContent = function (e) {
                    elm = $(e.target);
                    $(elm).next().slideToggle();
                    $(elm).toggleClass('active');
                }

            }],
        template: '<div class="grouppanel" ng-transclude>' +
            '</div>',
        replace: true
    };
});

APP.directive('grouppane', function () {
    return {
        require: '^grouppanel',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@',
            status: '@'
        },
        controller: ["$scope",
            function ($scope) {
                $scope.toggleContent = function (e) {
                    elm = $(e.target);
                    $(elm).next().slideToggle('fast');
                    $(elm).toggleClass('active');
                }

            }],
        link: function (scope, element, attrs, GpanelCtrl) { },
        template: '<div>' +
            '<div class="grouppane-head  {{status}}" ng-click="toggleContent($event)">{{title}}</div>' +
            '<div class="grouppane-content {{status}}" ng-transclude></div>' +
            '</div>',
        replace: true
    };
});