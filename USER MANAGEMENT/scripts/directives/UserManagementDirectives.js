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
                }

                this.addPane = function (pane) {
                    if (panes.length == 0) $scope.select(pane);
                    panes.push(pane);
                }
      }],
        template: '<div class="tabs">' +
            '<ul class="tabs-head clearfix">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" ng-click="select(pane)">{{pane.title}}</li>' +
            '</ul>' +
            '<div class="tab-content" ng-transclude></div>' +
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
        link: function (scope, element, attrs, GpanelCtrl) {},
        template: '<div>' +
            '<div class="grouppane-head  {{status}}" ng-click="toggleContent($event)">{{title}}</div>' +
            '<div class="grouppane-content {{status}}" ng-transclude></div>' +
            '</div>',
        replace: true
    };
});

function showPopup(content, prop){
    
    prop = prop?prop:{};
    
    prop.width = prop.width | 300;
    prop.height = prop.height | 300;
    prop.onclose = prop.onclose | function(){};
    
    var template = '<div class="popup-wrapper">'+
                    '<div class="popup">'+
                        '<div class="popup-head">'+
                            '<img src="images/default.png" alt=""> Change Password'+
                            '<a href="" class="popup-close close-btn">&times;</a></div>'+
                        '<div class="popup-content"></div>'+
                        '<div class="popup-foot">'+
                            '<a class="button">Save</a> '+
                            '<a class="button close-btn">Cancel</a></div>'+
                        '</div>'+
                    '</div>';
    var popup = $(template);        
    var close = popup.find('.close-btn');
    var popupwindow = popup.find('.popup');
    var popupcontent = popup.find('.popup-content');
    var popupfoot = popup.find('.popup-foot');
    var popuphead = popup.find('.popup-head');
    var cntlBtn = popup.find('button').eq(0);
    
    if(typeof content == 'object'){
        popupcontent.append(content);
    }
    else{
        popupcontent.html(content);
    }
    
    popup.appendTo('body');
        
    popupwindow.draggable({ 
        containment:'parent',
        handle: '.popup-head'
    });
    
    close.bind('click', function(e){
        e.preventDefault();
        if(typeof prop.onclose == 'function')
        prop.onclose();
        $(this).parents('.popup-wrapper').remove();
    });
    
    popupwindow.width(prop.width);
    popupwindow.height(prop.height);
    
    $(window).resize(function(){
        var lc = $(window).width()/2 - popupwindow.width()/2;
        var tc = $(window).height()/2 - popupwindow.height()/2;
        
        popupwindow.css({'left': lc+'px', top: tc + 'px'});
    }).resize();
    
    popupcontent.height(popupwindow.height()-popupfoot.height()-popuphead.height()-66);
    
    return [popup, cntlBtn];
}