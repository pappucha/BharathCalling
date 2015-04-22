//Sortable
/*APP.directive('sortable', function ($document, $compile) {
    return function (scope, element, attrs) {
        var left = 0;
        var top = 0;
        $(element).sortable({
            connectWith: '[sortable]',
            update: scope.sortHandler,
            placeholder: 'sort-placeholder',
            forcePlaceholderSize: true,
            cancel:'.icon',
            start: function (event, ui) {
                ui.item.data('start', ui.item.index());
                var elm = ui.item.children('.menu');
                $(ui.placeholder).width(elm.outerWidth() - 2).height(elm.parent().outerHeight() - 2);
            },
            sort: function (event, ui) {
                left = ui.item.position().left;
                top = ui.item.position().top;
            },
            grid: [20, 1],
            stop: function (event, ui) {                
                var elm = ui.item;
                var pelm = ui.item.prev();
                if (pelm.length) {
                    var pleft = pelm.position().left;
                    var leftOffset = left - pleft;
                    if (leftOffset >= 20) {
                        var submenuElm = pelm.children('ul');
                        if(!submenuElm.length){
                            submenuElm = $compile('<ul sortable></ul>')(scope);
                            submenuElm.appendTo(pelm);
                        }
                        elm.appendTo(submenuElm);
                    }
                    else{
                        
                    }
                }
                //scope.initSortable();
               // return false;
                 scope.initSortable();
            }
            ,update:function(){
                scope.initSortable();
            }
        });
    };
});
*/

APP.directive('sortable', function ($document, $compile, $timeout) {
    return {
	scope:false,
	link:function (scope, element, attrs, $rootScope) {
			var elmScope = scope.$parent;
			var tPosition ={left:0, top: 0};
			angular.element(element).sortable({
			    connectWith: '[sortable]',
				update: scope.sortHandler,
				placeholder: 'sort-placeholder',
				forcePlaceholderSize: true,
				cancel: '.icon, .edit-menu-wrapper,.edit-menu-wrapper *',
				start: function (event, ui) {
					scope.Utility.removeEditor();
					ui.item.data('start', {index:ui.item.index(), position:ui.item.position()});
					var elm = ui.item.children('.menu');
					$(ui.placeholder).width(elm.outerWidth() - 2).height(elm.parent().outerHeight() - 2);
				},
				grid: [20, 1],
				sort: function (event, ui) {
					tPosition = ui.item.position();
				},
				stop: function (event, ui) {
					var parentScope = elmScope.$parent.$parent;
					var start = ui.item.data('start');
					var end = {
						index: ui.item.index(),
						position: tPosition
					};
					
					if(start.index == end.index){                    
						var offsetLeft = end.position.left - start.position.left;						
						if(offsetLeft>=20){
							if(start.index>0)
							{
								elmScope.menu.ChildNodes[start.index-1].ChildNodes.push(elmScope.menu.ChildNodes.splice(start.index, 1)[0]);
							}
						}                 
						else if(offsetLeft<=-20){
							var immediateParent = elmScope.$parent.$parent;
							var index = $.inArray(elmScope.menu,immediateParent.menu.ChildNodes);
							if(index>=0){
								immediateParent.menu.ChildNodes.splice(index+1, 0 , elmScope.menu.ChildNodes.splice(start.index,1)[0]);
							}
						}						
					}
					else{              
						if(!angular.element(ui.item.parents('li').eq(0)).scope())
							return false;
						var destElmScope =  angular.element(ui.item.parents('li').eq(0)).scope().$parent;						
						var srcElmScope = angular.element(ui.item).scope().$parent;
						var index = $.inArray(srcElmScope.menu, elmScope.menu.ChildNodes);
						if(index>=0){
							destElmScope.menu.ChildNodes.splice(end.index, 0, elmScope.menu.ChildNodes.splice(index,1)[0]);
							setTimeout(function(){
								angular.element('.menu-config li').scope().$parent.initSortable();
							},10);
							return false;
						}
					}
					setTimeout(function(){
						angular.element('.menu-config li').scope().$parent.initSortable();
					},10);
					return true;
				}
			});
			
			scope.removeElement = function(elmScope){
				var index = $.inArray(elmScope.menu, elmScope.$parent.menu.ChildNodes);
				if(index>=0){
					elmScope.$parent.menu.ChildNodes.splice(index,1);
				}
			};
			scope.insertElement = function(pelmScope, elmScope){
				if(!pelmScope.menu.ChildNodes){
					pelmScope.menu.ChildNodes = [];
				}
				pelmScope.menu.ChildNodes.push($.extend(elmScope.menu,{},true));
				scope.removeElement(elmScope);
			};
		}
	};
});


//draggable
APP.directive('draggable', function ($document) {
    return function (scope, element, attrs) {
        angular.element(element).draggable({
            stop: scope.dragHandler,
            revert: true
        });

    };
});

//Resizex
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

//attach nicescroll to element
APP.directive('scrollable', function ($document) {
    return function (scope, element, attrs) {
        angular.element(element).niceScroll({
            cursorborder: '#000',
            cursorcolor: '#048f99',
            cursorborderradius: '5px',
            cursorwidth: '5px',
            spacebarenabled: false,
            enablekeyboard: false
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
            '<div class="tab-content" yresize="200" ng-transclude></div>' +
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