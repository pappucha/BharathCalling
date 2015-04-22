//drag directive
APP.directive('draggable', function ($document) {
    return function (scope, element, attrs) {
        var settings = eval('[' + attrs.draggable + ']')[0];
        $(element).draggable(settings);
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

//Resizex
APP.directive('xresize', function ($document) {
    return function (scope, element, attrs) {
        $(window).resize(function () {
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

APP.directive('yresize', function ($document) {
    return function (scope, element, attrs) {
        $(window).resize(function () {
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

APP.directive('vtabs', function () {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope, $element, $timeout) {
            var panes = $scope.panes = [];

            $scope.select = function (pane) {
                angular.forEach(panes, function (pane) {
                    pane.selected = false;
                });
                pane.selected = true;
                $timeout(function(){
                    $(ACTIVITY_CONTAINTER).getNiceScroll().resize();
                    $(TEMPLATE_CONTAINER).getNiceScroll().resize();
                },100);
            };

            this.addPane = function (pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        link: function (scope, element, attrs) {

        },
        template: '<div><ul class="vtabs">' + '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" ng-click="select(pane)">{{pane.name}}</li>' + '</ul><div class="vtab-contents" ng-transclude></div></div>',
        replace: true
    };
});

APP.directive('vpane', function () {
    return {
        require: '^vtabs',
        restrict: 'E',
        transclude: true,
        scope: {
            'class': '@',
            'name': '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="vtab-content" ng-class="{active: selected}"><div scrollable ng-transclude>' + '</div></div>',
        replace: true
    };
});
//tooltabs
APP.directive('toolstab', function () {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope, $element) {
            var panes = $scope.panes = [];

            $scope.select = function (pane) {
                angular.forEach(panes, function (pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }

            this.addPane = function (pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        template: '<div class="tools-tab tabbable">' + '<ul class="nav nav-tabs">' + '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' + '<a href="" ng-click="select(pane)" class="icon {{pane.class}}"></a>' + '</li>' + '</ul>' + '<div class="tab-content" ng-transclude></div>' + '</div>',
        replace: true
    };
});

APP.directive('toolspane', function () {
    return {
        require: '^toolstab',
        restrict: 'E',
        transclude: true,
        scope: {
            'class': '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' + '</div>',
        replace: true
    };
});

/*properties*/
APP.directive('property', function () {
    var template = '<section class="property-window" draggable="{handle: \'.handler\',containment:\'parent\'}">';
    template = template + '<div class="handler" ng-modal="title">{{title}} ';
    template = template + '<a href="" class="toggle" ng-click="toggle($event)">&#9660;</a>';
    template = template + '</div>';
    template = template + '<div class="property-container">';
    template = template + '<div id="{{gridid}}" width="100%"></div>';
    template = template + '</div>';
    template = template + '</section>';

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'title': '@',
            'gridid': "@"
        },
        controller: 'PropertyController',
        template: template,
        replace: true
    };
});