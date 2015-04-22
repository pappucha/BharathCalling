APP.directive('editor', function ($timeout, $compile) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.init = function () {
                $scope.EditorUtil.init();
                $scope.AutoComplete.init();
                $scope.NAVUtil.init();
                $scope.CODEUtil.init();
            };

            $scope.EditorUtil = {
                init: function () {
                    //Binds keybord event handler to editor
                    $(EDITOR).bind('keydown', $scope.EditorUtil.NavigationHandler);
                    //restrict default backspace action
                    $(document).on('keydown', function (e) {
                        e.stopPropagation();
                        if (!$(e.target).is('input,select')) {
                            var key = e.which | e.keyCode;
                            if (key == 8) {
                                return false;
                            }
                        }
                    });

                    $(document).on('click', EDITOR, function (e) {
                        e.stopPropagation();
                    });

                    $(document).on('click', function (e) {
                        $scope.KEYBOARDUtil.flags.showAutoComplete = false;
                        $('.' + AUTOCOMPLETE).remove();
                        $scope.KEYBOARDUtil.flags.insertNext = true;
                    });

                    $scope.EditorUtil.initWindowEvents();
                },

                initWindowEvents: function () {
                    $(window).resize(function () {
                        $scope.NAVUtil.resetRowColumns();
                    });

                    /*window.onbeforeunload = function () {
                        return confirm('Are you sure want to leave this page?');
                    };*/
                },

                NavigationHandler: function (e) {
                    e.stopPropagation();
                    var key = e.which | e.keyCode;
                    //console.log(key);                    
                    if ($(e.target).is(CONTENTEDITABLE)) {
                        if (key == 27 || key == 9) {
                            $(EDITOR).focus();
                            $scope.NAVUtil.resetRowColumns();
                            return false;
                        }
                        return true;
                    } else {
                        switch (key) {
                            //left
                            case 37:
                                $scope.KEYBOARDUtil.leftKeyHandler();
                                break;

                                //right
                            case 39:
                                $scope.KEYBOARDUtil.rightKeyHandler();
                                break;

                                //up
                            case 38:
                                $scope.KEYBOARDUtil.upKeyHandler();
                                break;

                                //down
                            case 40:
                                $scope.KEYBOARDUtil.downKeyHandler();
                                break;

                                //home
                            case 36:
                                $scope.KEYBOARDUtil.homeKeyHandler();
                                break;

                                //end                        
                            case 35:
                                $scope.KEYBOARDUtil.endKeyHandler();
                                break;

                                //page up
                            case 33:
                                $scope.KEYBOARDUtil.pageUpKeyHandler();
                                break;

                                //page down
                            case 34:
                                $scope.KEYBOARDUtil.pageDownKeyHandler();
                                //space bar
                            case 32:
                                if (e.ctrlKey)
                                    $scope.KEYBOARDUtil.controlSpaceKeyHandler();
                                else if (e.shiftKey)
                                    $scope.KEYBOARDUtil.shiftSpaceKeyHandler();
                                else {
                                    if ($scope.codeStack.length > 0)
                                        $scope.KEYBOARDUtil.spaceKeyHandler();
                                }
                                break;
                                //esc key
                            case 27:
                                $scope.KEYBOARDUtil.escKeyHandler();
                                break;
                                //enter key
                            case 13:
                                if (e.ctrlKey) {
                                    $scope.KEYBOARDUtil.controlEnterHadler();
                                } else {
                                    $scope.KEYBOARDUtil.enterKeyHandler();
                                }
                                break;
                                //backspace
                            case 8:
                                $scope.KEYBOARDUtil.backspaceKeyHandler();
                                break;
                                //delete
                            case 46:
                                if (e.ctrlKey && $scope.codeStack.length > 0)
                                    $scope.KEYBOARDUtil.controlDeleteKeyHandler();
                                else
                                    $scope.KEYBOARDUtil.deleteKeyHandler();
                                break;
                                //tab key pressed
                            case 9:
                                if (e.shiftKey)
                                    $scope.KEYBOARDUtil.shiftTabKeyHandler();
                                else
                                    $scope.KEYBOARDUtil.tabKeyHandler();
                                return false;
                                break;
                        }
                        if (key != 17)
                            $scope.KEYBOARDUtil.apply();
                        return false;
                    }
                }
            };

            $scope.CODEUtil = {
                init: function () {

                    //doble clik the code element to change value
                    $(document).on('dblclick', EDITOR + ' ' + CODE, function (e) {
                        e.stopPropagation();
                        $scope.KEYBOARDUtil.flags.insertNext = false;
                        $scope.KEYBOARDUtil.flags.showAutoComplete = true;
                        $scope.KEYBOARDUtil.flags.row = $(this).attr('row');
                        $scope.KEYBOARDUtil.flags.column = $(this).attr('column');
                        $scope.KEYBOARDUtil.apply();
                    });

                    $(document).on('dblclick', 'input,select', function (e) {
                        e.stopPropagation();
                    });

                    $(document).on('click', EDITOR + ' ' + CODE, function (e) {
                        e.stopPropagation();
                        $scope.KEYBOARDUtil.flags.insertNext = false;
                        $scope.KEYBOARDUtil.flags.showAutoComplete = false;
                        $scope.KEYBOARDUtil.flags.row = $(this).attr('row');
                        $scope.KEYBOARDUtil.flags.column = $(this).attr('column');
                        $scope.KEYBOARDUtil.apply();
                    });

                    $(document).on('click', EDITOR + ' ' + CODE + ' select', function (e) {
                        e.stopPropagation();
                    });

                    $(document).on('click', EDITOR + ' ' + CODE + ' input', function (e) {
                        e.stopPropagation();
                    });

                    $(document).on('click', EDITOR + ' ' + BLOCK, function (e) {
                        e.stopPropagation();
                        $(EDITOR).focus();
                        if (!$(this).find(CURSOR).length) {
                            $scope.NAVUtil.moveToBlock(this);
                        }
                    });
                },

                getObject: function (elm) {
                    var elmScope = angular.element(elm).scope();
                    var type = $('.' + AUTOCOMPLETE).attr('type');
                    var cObj = {};
                    var data = elmScope.data;

                    var currentScope = angular.element($(CURSOR).prevAll('.' + OPERAND_LEFT).first()).scope();

                    if (typeof data == 'string') {
                        cObj = {
                            ID: "",
                            Name: data,
                            Object: "",
                            Type: "",
                            Values: currentScope ? currentScope.e.Values : [],
                            CodeType: type,
                            Action: $scope.ActionUtil.getObjectByTypeAction($scope.code.Type, (type == STATEMENT ? data : '')),
                            Value: "",
                        };
                    } else {
                        cObj = {
                            ID: data.ID,
                            Name: data.Name,
                            Object: data.Object,
                            Type: data.Type,
                            Values: data.Values,
                            CodeType: type,
                            Action: $scope.ActionUtil.getObjectByTypeAction($scope.code.Type, (type == STATEMENT ? data : '')),
                            Value: "",
                        };
                    }
                    return cObj;
                },

                insertElement: function () {
                    var elm = $('.' + AUTOCOMPLETE);
                    if (elm.length) {
                        var currentElm = elm.find('.current');

                        //temp position of active element                        
                        var elmPosition = null;
                        var positon = {
                            row: 0,
                            column: 0
                        };
                        if ($(ACTIVE_NODE).length)
                            positon = {
                                row: +$(ACTIVE_NODE).attr('row'),
                                column: +$(ACTIVE_NODE).attr('column')
                            };

                        var block = $(CURSOR).parents(BLOCK);
                        var rIndex = block.index();
                        rIndex = rIndex < 0 ? 0 : rIndex;
                        var cIndex = $scope.DOMUtil.activeCodeIndex(block);
                        cIndex = cIndex < 0 ? 0 : cIndex;

                        var CObject = $scope.CODEUtil.getObject(currentElm);

                        if ($scope.KEYBOARDUtil.flags.insertNext)
                            $scope.codeStack[rIndex].splice(cIndex + 1, 0, CObject);
                        else
                            $scope.codeStack[rIndex].splice(cIndex, 1, CObject);


                        if (!block.find(CODE).length) {
                            elmPosition = $(CURSOR).prev();
                        }

                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }

                        $timeout(function () {
                            $scope.NAVUtil.resetRowColumns();
                            var nextFocus = $(CURSOR).prev().not(CONSTANT);
                            if (elmPosition) {
                                nextFocus = elmPosition.nextAll(CODE).eq(0);
                                positon = {
                                    row: nextFocus.attr('row'),
                                    column: nextFocus.attr('column')
                                };
                            } else if ($scope.KEYBOARDUtil.flags.insertNext) {
                                nextFocus = $(CURSOR).next();
                                nextFocus = nextFocus.length ? nextFocus : $(CURSOR).prev();
                                positon = {
                                    row: nextFocus.attr('row'),
                                    column: nextFocus.attr('column')
                                };
                            }

                            $scope.KEYBOARDUtil.flags.row = positon.row;
                            $scope.KEYBOARDUtil.flags.column = positon.column;
                            $scope.NAVUtil.moveCursor($scope.DOMUtil.getElementByRowColumn(positon.row, positon.column));
                        }, 50);
                    }
                },

                insertBlock: function () {
                    $scope.codeStack.push([]);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                },

                deleteBlock: function (block) {
                    var index = block.index();

                    $(CURSOR).appendTo(EDITOR);

                    $scope.codeStack.splice(index, 1);

                    if ($scope.codeStack.length == 0)
                        $scope.CODEUtil.insertBlock();

                    $scope.$apply();
                    $timeout(function () {
                        $scope.NAVUtil.resetRowColumns();
                        var nextBlock = $(BLOCK).eq(0);
                        $scope.NAVUtil.moveToBlock(nextBlock);
                        $scope.KEYBOARDUtil.tabKeyHandler();
                    }, 100);
                },

                setActive: function (elm) {
                    $scope.CODEUtil.removeActive();
                    $(elm).addClass('active');
                },

                removeActive: function () {
                    $(ACTIVE_NODE).removeClass('active');
                },

                removeElement: function (activeElement) {                    
                    var block = $(CURSOR).parents(BLOCK);
                    var rIndex = block.index();
                    var cIndex = $scope.DOMUtil.activeCodeIndex(block);
                    if (rIndex >= 0 && cIndex >= 0) {
                        $scope.codeStack[rIndex].splice(cIndex, 1);
                    }
                    $scope.$apply(function () {
                        $timeout(function () {
                            if (!$(CURSOR).length) {
                                $scope.NAVUtil.init();
                            }
                            var nextFocus = $(BLOCK).eq(rIndex).find(CODE).eq(cIndex - 1);
                            nextFocus = nextFocus.length ? nextFocus : $(ACTIVE_NODE);
                            $scope.KEYBOARDUtil.flags.row = nextFocus.attr('row');
                            $scope.KEYBOARDUtil.flags.column = nextFocus.attr('column');
                            $scope.NAVUtil.moveCursor(nextFocus, true);
                        }, 100);
                    });
                },

                getOperandValues: function (value) {
                    var karr = [];
                    $.each($scope.KeywordArray.operand, function (i, op) {
                        if (op.Name == value)
                            karr = op.Values;
                    });
                    return karr;
                },

                getTemplate: function (name) {
                    return name + '.html';
                }
            };

            $scope.KEYBOARDUtil = {
                flags: {
                    scrollPos: 0,
                    showAutoComplete: false,
                    row: 0,
                    column: 0,
                    insertNext: true
                },

                leftKeyHandler: function () {
                    if ($scope.KEYBOARDUtil.flags.column > 0)
                        $scope.KEYBOARDUtil.flags.column--;
                    else if ($scope.KEYBOARDUtil.flags.row > 0) {
                        $scope.KEYBOARDUtil.flags.row--;
                        $scope.KEYBOARDUtil.flags.column = $scope.DOMUtil.getElementsByRow($scope.KEYBOARDUtil.flags.row).length - 1;
                    }
                    $scope.insertNext = true;
                },

                rightKeyHandler: function () {
                    if ($scope.KEYBOARDUtil.flags.column < $scope.DOMUtil.getElementsByRow($scope.KEYBOARDUtil.flags.row).length - 1)
                        $scope.KEYBOARDUtil.flags.column++;
                    else if ($scope.KEYBOARDUtil.flags.row < $scope.DOMUtil.getRowLength() - 1) {
                        $scope.KEYBOARDUtil.flags.row++;
                        $scope.KEYBOARDUtil.flags.column = 0;
                    }
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                },

                upKeyHandler: function () {
                    if ($('.' + AUTOCOMPLETE).length) {
                        var elmList = $('.' + AUTOCOMPLETE + ' li')
                        var celm = elmList.filter('.current');
                        celm.removeClass('current');
                        if (celm.prev().not('.filter').length)
                            celm.prev().addClass('current');
                        else
                            elmList.last().addClass('current');

                        $('.' + AUTOCOMPLETE + ' .current').focus();
                        $(EDITOR).focus();

                    } else if ($scope.KEYBOARDUtil.flags.row > 0) {
                        $scope.KEYBOARDUtil.flags.insertNext = true;
                        $scope.KEYBOARDUtil.flags.row--;
                    }
                },

                downKeyHandler: function () {
                    if ($('.' + AUTOCOMPLETE).length) {
                        var elmList = $('.' + AUTOCOMPLETE + ' li')
                        var celm = elmList.filter('.current');
                        celm.removeClass('current');

                        if (celm.next().length)
                            celm.next().addClass('current');
                        else
                            elmList.first().addClass('current');

                        $('.' + AUTOCOMPLETE + ' .current').focus();
                        $(EDITOR).focus();
                    } else if ($scope.KEYBOARDUtil.flags.row < $scope.DOMUtil.getRowLength() - 1) {
                        $scope.KEYBOARDUtil.flags.insertNext = true;
                        $scope.KEYBOARDUtil.flags.row++;
                    }
                },

                homeKeyHandler: function () {
                    $scope.KEYBOARDUtil.flags.column = 0;
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                },

                endKeyHandler: function () {
                    $scope.KEYBOARDUtil.flags.column = $scope.DOMUtil.getElementsByRow($scope.KEYBOARDUtil.flags.row).length - 1;
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                },

                pageUpKeyHandler: function () {
                    var step = Math.floor(($(EDITOR).height()) / 30);
                    $scope.KEYBOARDUtil.flags.row = $scope.KEYBOARDUtil.flags.row - step + 1;
                    $scope.KEYBOARDUtil.flags.row = $scope.KEYBOARDUtil.flags.row > 0 ? $scope.KEYBOARDUtil.flags.row : 0;
                    $scope.KEYBOARDUtil.flags.scrollPos = $scope.KEYBOARDUtil.flags.row * 30;
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                },

                pageDownKeyHandler: function () {
                    var step = Math.floor(($(EDITOR).height()) / 30);
                    if ($scope.KEYBOARDUtil.flags.row + step - 1 < $scope.DOMUtil.getRowLength() - 1) {
                        $scope.KEYBOARDUtil.flags.row = +$scope.KEYBOARDUtil.flags.row + step - 1;
                        $scope.KEYBOARDUtil.flags.scrollPos = $scope.KEYBOARDUtil.flags.row * 30;
                        $scope.KEYBOARDUtil.flags.insertNext = true;
                    }
                },

                spaceKeyHandler: function () {
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                    $scope.KEYBOARDUtil.flags.showAutoComplete = true;
                },

                controlSpaceKeyHandler: function () {
                    $scope.KEYBOARDUtil.flags.insertNext = false;
                    $scope.KEYBOARDUtil.flags.showAutoComplete = true;
                },

                shiftSpaceKeyHandler: function () {
                    $timeout(function () {
                        $(ACTIVE_NODE).find('input,select').filter(':visible').focus();
                    }, 20);
                },

                escKeyHandler: function () {
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                    $scope.KEYBOARDUtil.flags.showAutoComplete = false;
                    $('.' + AUTOCOMPLETE).remove();
                },

                enterKeyHandler: function () {
                    $scope.CODEUtil.insertElement();
                    $scope.KEYBOARDUtil.flags.showAutoComplete = false;
                },

                controlEnterHadler: function () {
                    if ($scope.codeStack.length)
                        $scope.CODEUtil.insertBlock();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                },

                backspaceKeyHandler: function () {
                    if (!$('.' + AUTOCOMPLETE).length) {
                        $scope.CODEUtil.removeElement($(ACTIVE_NODE));
                    }
                },

                deleteKeyHandler: function () {
                    $scope.CODEUtil.setActive($(ACTIVE_NODE).nextAll(CODE).first());
                    $scope.CODEUtil.removeElement($(ACTIVE_NODE));
                },

                controlDeleteKeyHandler: function () {
                    var block = $(CURSOR).parents(BLOCK);
                    $scope.CODEUtil.deleteBlock(block);
                },

                tabKeyHandler: function () {
                    if ($('.' + AUTOCOMPLETE).length) {
                        var elm = $('.' + AUTOCOMPLETE).find('.filter a.active');
                        var nextElm = elm.next().length ? elm.next() : $('.' + AUTOCOMPLETE).find('.filter a').first();
                        $scope.filter = {
                            Object: nextElm.text()
                        };
                        $scope.$apply();
                    } else {
                        var nextBlock = $(CURSOR).parents(BLOCK).nextAll(BLOCK).first();
                        if (!nextBlock.length)
                            nextBlock = $(BLOCK).first();
                        $scope.NAVUtil.moveToBlock(nextBlock);
                    }
                },

                shiftTabKeyHandler: function () {
                    var prevBlock = $(CURSOR).parents(BLOCK).prevAll(BLOCK).first();
                    if (!prevBlock.length)
                        prevBlock = $(BLOCK).last();
                    $scope.NAVUtil.moveToBlock(prevBlock);
                },

                apply: function () {
                    if ($(ACTIVE_NODE).length && $(CURSOR).parents(BLOCK).find(CODE).length) {
                        var elm = $scope.DOMUtil.getElementByRowColumn($scope.KEYBOARDUtil.flags.row, $scope.KEYBOARDUtil.flags.column);
                        elm = elm.length ? elm : $scope.DOMUtil.getElementByRowColumn($scope.KEYBOARDUtil.flags.row, $scope.DOMUtil.getElementsByRow($scope.KEYBOARDUtil.flags.row).length - 1);
                        if (elm.length)
                            $scope.NAVUtil.moveCursor(elm);
                    }

                    if ($scope.KEYBOARDUtil.flags.showAutoComplete)
                        $scope.AutoComplete.show();
                    $(EDITOR).focus();
                    $scope.NAVUtil.moveScroll($scope.KEYBOARDUtil.flags.scrollPos);
                }
            };

            $scope.NAVUtil = {
                init: function () {
                    //insert cursor
                    $timeout(function () {
                        $(CURSOR).remove();
                        $('<span class="cursor"></span>').insertAfter($(BLOCK + ' ' + CONSTANT).first());
                        //init code elements for navigation
                        $scope.NAVUtil.resetRowColumns();
                    }, 300);
                },

                moveToBlock: function (block) {
                    $scope.KEYBOARDUtil.flags.insertNext = true;
                    $scope.KEYBOARDUtil.flags.showAutoComplete = false;
                    $scope.KEYBOARDUtil.flags.row = $(block).find(CODE).first().attr('row') ? $(block).find(CODE).first().attr('row') : 0;
                    $scope.KEYBOARDUtil.flags.column = 0;
                    $(CURSOR).insertAfter($(block).find(CONSTANT).first());
                    var next = $(CURSOR).next();
                    var prev = $(CURSOR).prev();
                    var nextElm = next.is(CONSTANT) ? prev : next;
                    $scope.CODEUtil.removeActive();
                    if (nextElm.length && !nextElm.is(CONSTANT))
                        $scope.CODEUtil.setActive(nextElm);
                },

                moveCursor: function (elm) {
                    if (!elm.length) {
                        elm = $(CURSOR).prev();
                    }
                    $scope.CODEUtil.setActive(elm);
                    $(CURSOR).insertAfter(elm);
                },

                resetRowColumns: function () {
                    var _tempElmObjArr = {};
                    $(EDITOR).find(CODE).each(function (i, elm) {
                        var offset = elm.offsetTop;
                        if (_tempElmObjArr[offset])
                            _tempElmObjArr[offset].push(elm);
                        else
                            _tempElmObjArr[offset] = [elm];
                    });
                    var r = 0;
                    var c = 0;
                    for (eArr in _tempElmObjArr) {
                        $(_tempElmObjArr[eArr]).each(function (i, elm) {
                            $(elm).attr({
                                row: r,
                                column: i
                            });
                        });
                        r++;
                    }

                    /* if (!$(ACTIVE_NODE).length)
                        $($scope.DOMUtil.getElementByRowColumn(0, 0)).addClass('active');*/

                    $('.' + AUTOCOMPLETE).remove();
                },

                moveScroll: function (pos) {
                    if (!pos)
                        pos = $scope.KEYBOARDUtil.flags.row * 30;

                    if ((pos % ($(EDITOR).height() - 50)) < 30 || $(CURSOR).position().top < 54) {
                        $(EDITOR).getNiceScroll().doScrollPos(0, pos);
                    }
                }
            };

            $scope.DOMUtil = {
                activeCodeIndex: function (block) {
                    var code = block.find(CODE);
                    index = -1;
                    for (var i = 0; i < code.length; i++) {
                        if ($(code[i]).is(ACTIVE))
                            index = i;
                    }
                    return index;
                },

                getElementByRowColumn: function (row, column) {
                    return $scope.DOMUtil.getElementsByRow(row).filter('[column="' + column + '"]');
                },

                getElementsByRow: function (row) {
                    return $(EDITOR + ' [row="' + row + '"]');
                },

                getRowLength: function () {
                    return $scope.DOMUtil.getElementsByColumn(0).length;
                },

                getElementsByColumn: function (column) {
                    return $(EDITOR + ' [column="' + column + '"]');
                },

                getType: function (elm, insertNext) {
                    if ($(CURSOR).prevAll(END_OF_CONDITION).length && !($(CURSOR).prev().is(END_OF_CONDITION) && $scope.KEYBOARDUtil.flags.insertNext == false))
                        return STATEMENT;
                    else if (insertNext) {
                        var type = $scope.DOMUtil.getType(elm);
                        switch (type) {
                            case OPERAND_LEFT:
                                return OPERATOR;
                                break;
                            case OPERAND_RIGHT:
                                return BOOL;
                                break;
                            case OPERATOR:
                                return OPERAND_RIGHT;
                                break;
                            case BOOL:
                                return OPERAND_LEFT;
                                break;
                            default:
                                return OPERAND_LEFT;
                                break;
                        }
                    } else {
                        elm = $(elm);
                        if (elm.hasClass(OPERATOR))
                            return OPERATOR;
                        else if (elm.hasClass(BOOL))
                            return BOOL;
                        else if (elm.hasClass(OPERAND_LEFT))
                            return OPERAND_LEFT;
                        else if (elm.hasClass(OPERAND_RIGHT))
                            return OPERAND_RIGHT;
                        else
                            return undefined;
                    }
                },

                isThen: function (v) {
                    return v == THEN;
                },

                hasValueList: function (e) {
                    return e.Values.length ? true : false;
                }
            };

            $scope.AutoComplete = {

                data: [],

                init: function () {
                    //Autocomplte event handlers
                    //double click to show autocomplete
                    $(document).on('dblclick', EDITOR, function (e) {
                        e.stopPropagation();
                        if ($(BLOCK).length) {
                            $scope.KEYBOARDUtil.flags.insertNext = true;
                            $scope.AutoComplete.show();
                        }
                    });

                    //mouse action for autocomplete
                    $(document).on('mousemove', EDITOR + ' .' + AUTOCOMPLETE + ' li', function (e) {
                        e.stopPropagation();
                        $('.' + AUTOCOMPLETE + ' .current').removeClass('current');
                        $(this).addClass('current');
                    });
                },

                getData: function (type) {
                    var data = [];
                    switch (type) {
                        case OPERAND_RIGHT:
                            var elm = $(ACTIVE_NODE).prevAll('.' + OPERAND_LEFT).first();
                            var elmScope = angular.element(elm).scope();

                            if (elmScope.e.Type == 'List' && elmScope.e.Values.length > 0)
                                data = elmScope.e.Values;
                            else
                                data = ['[String]'];
                            break;
                        case OPERAND_LEFT:
                            data = $scope.KeywordArray[OPERAND];
                            break;
                        case STATEMENT:
                            data = $scope.ActionUtil.getByType($scope.code.Type).actionList;
                            break;
                        case OPERATOR:
                        case BOOL:
                        default:
                            data = $scope.KeywordArray[type];
                            break;
                    }
                    return data;
                },

                DisplayText: function (d) {
                    if (typeof d == 'object') {
                        return d.Name;
                    }
                    return d;
                },

                generate: function (type, activeElement) {
                    $scope.AutoComplete.remove();
                    $scope.AutoComplete.data = $scope.AutoComplete.getData(type);
                    $scope.filter = "";

                    var template = '<div type="' + type + '" class="' + AUTOCOMPLETE + '">';
                    if (type == OPERAND_LEFT) {
                        switch ($scope.code.Type) {
                            case 'Form':
                                $scope.filter = {
                                    Object: 'Objects'
                                };
                                template = template + '<div align="right" class="filter">' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Objects\')}" ng-click="AutoComplete.applyFilter($event)">Objects</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'User\')}" ng-click="AutoComplete.applyFilter($event)">User</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Item\')}" ng-click="AutoComplete.applyFilter($event)">Item</a>' +
                                    '</div>'

                                break;
                            case 'Workflow':
                                $scope.filter = {
                                    Object: 'Job'
                                };
                                template = template + '<div align="right" class="filter">' +
                                    '<a href="" ng-class="{active:(filter.Object==\'User\')}" ng-click="AutoComplete.applyFilter($event)">User</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Item\')}" ng-click="AutoComplete.applyFilter($event)">Item</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Job\')}" ng-click="AutoComplete.applyFilter($event)">Job</a>' +
                                    '</div>'
                                break;
                            case 'Task':
                                $scope.filter = {
                                    Object: 'Job'
                                };
                                template = template + '<div align="right" class="filter">' +
                                    '<a href="" ng-class="{active:(filter.Object==\'User\')}" ng-click="AutoComplete.applyFilter($event)">User</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Item\')}" ng-click="AutoComplete.applyFilter($event)">Item</a>' +
                                    '<a href="" ng-class="{active:(filter.Object==\'Job\')}" ng-click="AutoComplete.applyFilter($event)">Job</a>' +
                                    '</div>'
                                break;
                        }
                    }
                    template = template + '<div class="autocomplete-elements"><ul><li tabindex="-1" ng-repeat="data in AutoComplete.data | filter:filter" ng-class="{current:$index==0}"' +
                        ' ng-keyup="CODEUtil.insertElement($event)"' +
                        ' ng-click="CODEUtil.insertElement($event)">{{AutoComplete.DisplayText(data)}}' +
                        '</li></ul></div>';

                    template = template + '</div>';

                    var elm = $compile(template)($scope);
                    $(elm).appendTo(EDITOR);

                    $scope.AutoComplete.setPosition(activeElement);
                    if (!$scope.KEYBOARDUtil.flags.insertNext) {
                        $(elm).addClass('replace');
                    }
                    $scope.$apply();
                    $timeout(function () {
                        var filter = $(elm).find('.filter');
                        var filterOffset = 0;
                        if (filter.length) {
                            filterOffset = filter.outerHeight();
                        }
                        var ulht = $(elm).find('ul').outerHeight();
                        ulht = ulht < 10 ? 180 : ulht;
                        $(elm).find('.autocomplete-elements').height((ulht > 300 ? 280 - filterOffset : ulht));
                        $scope.AutoComplete.setPosition(activeElement);
                    }, 10);
                    return elm;
                },

                applyFilter: function (event) {
                    var elm = $(event.target);
                    $scope.filter = {
                        Object: elm.html()
                    };
                },

                setPosition: function (activeElement) {
                    if (!$(CURSOR).length) {
                        $scope.NAVUtil.init();
                    }
                    var position = {};
                    var autocompleteElm = $('.' + AUTOCOMPLETE);
                    var top = activeElement.position().top + 25;
                    var leftOffset = +(activeElement.is('.' + STATEMENT) ? 15 : 0);
                    var left = $scope.KEYBOARDUtil.flags.insertNext ? $(CURSOR).position().left + leftOffset : activeElement.position().left + leftOffset;
                    var topMax = $(EDITOR).position().top + $(EDITOR).height();
                    var topMin;
                    if (top + $(autocompleteElm).height() >= topMax) {
                        position = {
                            top: (activeElement.position().top - 15 - $(autocompleteElm).height()) + 'px',
                            left: left + 'px'
                        };
                    } else {
                        position = {
                            top: top + 'px',
                            left: left + 'px'
                        };
                    }
                    autocompleteElm.css(position);
                    return autocompleteElm;
                },

                show: function () {                    
                    var activeElement = $(CURSOR).prev();
                    activeElement = activeElement.length ? activeElement : $(CURSOR).prevAll(CONSTANT).first();

                    var type = $scope.DOMUtil.getType(activeElement, $scope.KEYBOARDUtil.flags.insertNext);

                    var ReplaceOrInserNext = $scope.KEYBOARDUtil.flags.insertNext ? '' : '.replace';
                    if (type && !($('.' + AUTOCOMPLETE + ReplaceOrInserNext + '[type="' + type + '"]').length)) {
                        $scope.AutoComplete.generate(type, activeElement);
                    } else {
                        $scope.AutoComplete.setPosition(activeElement);
                    }
                },

                remove: function () {
                    $('.' + AUTOCOMPLETE).remove();
                }
            };

            $scope.ActionUtil = {
                getByType: function (type) {

                    switch (type) {
                        case "Workflow":
                            return $scope.ActionUtil.WorkflowActions;
                            break;
                        case "Form":
                            return $scope.ActionUtil.FormActions;
                            break;
                        case "Task":
                            return $scope.ActionUtil.TaskActions;
                            break;
                    }
                },

                getObjectByTypeAction: function (type, action) {
                    return $scope.ActionUtil.getByType(type).getObjectByAction(action);
                },

                WorkflowActions: {
                    actionList: ['INJECTTASKTEMPLATE'],
                    getObjectByAction: function (action) {
                        var obj = {
                            Property: '',
                            BoolOption: false,
                            StringValue: '',
                            ActionType: action,
                        };

                        switch (action) {
                            case "INJECTTASKTEMPLATE":
                                obj.BoolOption = false;
                                obj.StringValue = [];
                                break;
                            case "DEFAULT":
                                obj.BoolOption = false;
                                break;
                        }

                        return obj;
                    }
                },

                FormActions: {
                    actionList: ['DISABLE', 'EXCLUDE', 'ENABLE', 'HIDE', 'INCLUDE', 'SHOW', 'LABEL', 'DEFAULT','BUILDDESCRIPTION'],
                    getObjectByAction: function (action) {
                        var obj = {
                            Property: '',
                            BoolOption: false,
                            StringValue: '',
                            ActionType: action,
                        };

                        switch (action) {
                            case "SHOW":
                            case "HIDE":
                            case "ENABLE":
                            case "DISABLE":
                                obj.BoolOption = true;
                                break;
                            case "BUILDDESCRIPTION":
                            case "INCLUDE":
                            case "EXCLUDE":
                                obj.BoolOption = false;
                                obj.StringValue = [];
                                break;
                            case "LABEL":
                                obj.BoolOption = false;
                                break;
                            case "DEFAULT":
                                obj.BoolOption = false;
                                break;
                        }

                        return obj;
                    },
                    deleteStatementValue: function(e,index){
                        e.splice(index, 1);
                    }
                },

                TaskActions: {
                    actionList: [],
                    getObjectByAction: function (action) {
                        return {};
                    }
                }
            };

        },

        link: function (scope, editor, attrs, ctrl) {
            //init scrollbar position
            $(EDITOR).getNiceScroll().doScrollPos(0, 0);
        },

        template: '<div class="editor" sortable tabindex="1" yresize="142" ng-init="init()" scrollable>' +
            '<div class="block" ng-repeat="block in codeStack">' +
            '<span class="constant">if</span>' +
            '<span ng-repeat="e in block" ng-init="resetRowColumns()" class="code {{e.CodeType}}" ng-class="{then:DOMUtil.isThen(e.Name)}" type="{{e.CodeType}}">' +
                '<span ng-switch on="e.Values.length==0 && e.CodeType==\'' + OPERAND_RIGHT + '\'">' +
                    '<span ng-switch-when="true">' +
                        '<input type="text" maxlength="50" ng-model="e.Name" size="{{e.Name.length*1.1}}"/>' +
                    '</span>' +
                    '<span ng-switch-default>{{e.Name}}</span>' +
                '</span>' +
                '<span ng-switch on="e.CodeType">' +
                    '<span ng-switch-when="' + STATEMENT + '">' +
                        '<span ng-switch on="code.Type">' +
                            '<span ng-include="CODEUtil.getTemplate(e.Name)"></span>' +
                        '</span>' +
                    '</span>' +
                '</span>' +
            '</span>' +
            '<div class="constant">end if</div>' +
            '</div>' +
            '</div>',
        replace: true
    };
});