(function ($, window, document, undefined) {
    /* connect rapheal plugin */
    Raphael.fn.connection = function (obj1, obj2, line, bg) {
        var bb1, bb2, color, d, dis, dx, dy, i, j, p, path, res, x1, x2, x3, x4, y1, y2, y3, y4;
        if (obj1.line && obj1.from && obj1.to) {
            line = obj1;
            obj1 = line.from;
            obj2 = line.to;
        }
        bb1 = obj1.getBBox();
        bb2 = obj2.getBBox();
        p = [{
            x: bb1.x + bb1.width / 2,
            y: bb1.y - 1
        }, {
            x: bb1.x + bb1.width / 2,
            y: bb1.y + bb1.height + 1
        }, {
            x: bb1.x - 1,
            y: bb1.y + bb1.height / 2
        }, {
            x: bb1.x + bb1.width + 1,
            y: bb1.y + bb1.height / 2
        }, {
            x: bb2.x + bb2.width / 2,
            y: bb2.y - 1
        }, {
            x: bb2.x + bb2.width / 2,
            y: bb2.y + bb2.height + 1
        }, {
            x: bb2.x - 1,
            y: bb2.y + bb2.height / 2
        }, {
            x: bb2.x + bb2.width + 1,
            y: bb2.y + bb2.height / 2
        }];
        d = {};
        dis = [];
        i = 0;
        while (i < 4) {
            j = 4;
            while (j < 8) {
                dx = Math.abs(p[i].x - p[j].x);
                dy = Math.abs(p[i].y - p[j].y);
                if ((i === j - 4) || (((i !== 3 && j !== 6) || p[i].x < p[j].x) && ((i !== 2 && j !== 7) || p[i].x > p[j].x) && ((i !== 0 && j !== 5) || p[i].y > p[j].y) && ((i !== 1 && j !== 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
                j++;
            }
            i++;
        }
        if (dis.length === 0) {
            res = [0, 4];
        } else {
            res = d[Math.min.apply(Math, dis)];
        }
        x1 = p[res[0]].x;
        y1 = p[res[0]].y;
        x4 = p[res[1]].x;
        y4 = p[res[1]].y;
        dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        dy = Math.max(Math.abs(y1 - y4) / 2, 10);
        x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3);
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3);
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3);
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
        path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
        if (line && line.line) {
            line.bg && line.bg.attr({
                path: path
            });
            return line.line.attr({
                path: path
            });
        } else {
            color = (typeof line === "string" ? line : "#000");
            return {
                bg: bg && bg.split && this.path(path).attr({
                    stroke: bg.split("|")[0],
                    fill: "none",
                        "stroke-width": bg.split("|")[1] || 3
                }),
                line: this.path(path).attr({
                    stroke: color,
                    fill: "none"
                }),
                from: obj1,
                to: obj2
            };
        }
    };



    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },

        pan: function (deltaX, deltaY) {},

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        }
    },

    PanZoom = function (el, options) {
        var paper = el,
            container = paper.canvas.parentNode,
            me = this,
            settings = {},
            initialPos = {
                x: 0,
                y: 0
            },
            deltaX = 0,
            deltaY = 0,
            mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

        this.enabled = false;
        this.dragThreshold = 5;
        this.dragTime = 0;

        options = options || {};

        settings.maxZoom = options.maxZoom || 9;
        settings.minZoom = options.minZoom || 0;
        settings.zoomStep = options.zoomStep || 0.1;
        settings.initialZoom = options.initialZoom || 0;
        settings.initialPosition = options.initialPosition || {
            x: 0,
            y: 0
        };

        this.currZoom = settings.initialZoom;
        this.currPos = settings.initialPosition;

        repaint();

        container.onmousedown = function (e) {
            var evt = window.event || e;
            if (!me.enabled) return false;
            me.dragTime = 0;
            initialPos = getRelativePosition(evt, container);
            container.className += " grabbing";
            container.onmousemove = dragging;
            document.onmousemove = function () {
                return false;
            };
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        };

        container.onmouseup = function (e) {
            //Remove class framework independent
            document.onmousemove = null;
            container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
            container.onmousemove = null;
        };

        if (container.attachEvent) //if IE (and Opera depending on user setting)
        container.attachEvent("on" + mousewheelevt, handleScroll);
        else if (container.addEventListener) //WC3 browsers
        container.addEventListener(mousewheelevt, handleScroll, false);

        function handleScroll(e) {
            if (!me.enabled) return false;
            var evt = window.event || e,
                delta = evt.detail ? evt.detail : evt.wheelDelta * -1,
                zoomCenter = getRelativePosition(evt, container);

            if (delta > 0) delta = -1;
            else if (delta < 0) delta = 1;

            applyZoom(delta, zoomCenter);
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        }

        function applyZoom(val, centerPoint) {
            if (!me.enabled) return false;
            me.currZoom += val;
            if (me.currZoom < settings.minZoom) me.currZoom = settings.minZoom;
            else if (me.currZoom > settings.maxZoom) me.currZoom = settings.maxZoom;
            else {
                centerPoint = centerPoint || {
                    x: paper.width / 2,
                    y: paper.height / 2
                };

                deltaX = ((paper.width * settings.zoomStep) * (centerPoint.x / paper.width)) * val;
                deltaY = (paper.height * settings.zoomStep) * (centerPoint.y / paper.height) * val;

                repaint();
            }
             repaint();
        }

        this.applyZoom = applyZoom;

        function dragging(e) {
            if (!me.enabled) return false;
            var evt = window.event || e,
                newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep)),
                newPoint = getRelativePosition(evt, container);

            deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.width) * -1;
            deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.height) * -1;
            initialPos = newPoint;

            repaint();
            me.dragTime++;
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        }

        function repaint() {
            me.currPos.x = me.currPos.x + deltaX;
            me.currPos.y = me.currPos.y + deltaY;

            var newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep));

            if (me.currPos.x < 0) me.currPos.x = 0;
            else if (me.currPos.x > (paper.width * me.currZoom * settings.zoomStep)) {
                me.currPos.x = (paper.width * me.currZoom * settings.zoomStep);
            }

            if (me.currPos.y < 0) me.currPos.y = 0;
            else if (me.currPos.y > (paper.height * me.currZoom * settings.zoomStep)) {
                me.currPos.y = (paper.height * me.currZoom * settings.zoomStep);
            }
            paper.setViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight);
        }
    };

    PanZoom.prototype = panZoomFunctions;

    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];

        return {
            x: x,
            y: y
        };
    }

    function findPos(obj) {
        var posX = obj.offsetLeft,
            posY = obj.offsetTop,
            posArray;
        while (obj.offsetParent) {
            if (obj == document.getElementsByTagName('body')[0]) {
                break;
            } else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }
    
    Raphael.st.draggable = function(move,start,end, click) {
      var me = this;
      me.lx = 0;
      me.ly = 0;
      me.ox = me.ox || 0;
      me.oy = me.oy || 0;
          moveFnc = function(dx, dy, x, y, event) {
              me.lx = dx + me.ox;
              me.ly = dy + me.oy;
              if(x>=50 && y>=50){
                  me.transform('t' + me.lx + ',' + me.ly);
                  if(move)
                  move(dx, dy, x, y ,me, event);
              }
          },
          startFnc = function(x, y, event) {
              event.stopPropagation();
              if(start)
                  start(x, y, me, event);
          },
          endFnc = function(event) {
              me.ox = me.lx;
              me.oy = me.ly;
              if(end)
                  end(me, event);
          };

      return me.drag(moveFnc, startFnc, endFnc);
    };
    Raphael.st.undraggable = function(){
        var me = this;
        me.undrag();
        me.forEach(function(el){
            el.undrag();
        });
        return me;
    }
})(jQuery, window, document);