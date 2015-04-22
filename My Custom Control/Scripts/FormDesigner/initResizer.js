(function($){
	var repositionResizer = function(){
		$('.Resizer').each(function (index, elm) {
			var left = $(elm).next().offset().left - $(elm).parent().offset().left;
			$(elm).css('left', left + 'px');
		});

		$('.Row').each(function () {
		    var c = $(this).children('.Column');
		    var hArr = [];
		    c.each(function () {
		        hArr.push($(this).height());
		    });
		    var maxH = Math.max.apply(Math, hArr);
		    c.height(maxH);
		    c.each(function () {
		        $(this).find('.rpSlide').height(maxH - $(this).find('.RadTabStrip').height());
		    });
		});
	};
	var initResizer = function(){
		resizer = $('.Resizer');
		resizer.mousedown(function () {
			var x1 = $(this).prev().offset().left+10;
			var x2 = $(this).next().offset().left + $(this).next().width()+10;

			$(this).draggable('option', 'containment', [x1+50, 0, x2 -50, 0]);
		});
		resizer.draggable({
			axis: 'x',
			drag: columnResizeHandler,
			stop: function () {
			    var cW = $(this).parent().width();
			    var c = $(this).parent().children('.Column');
			    c.each(function () {
			        var w = parseFloat($(this).css('width'));
			        $(this).css({'width':((w * 100 / cW) + '%')});
			    });
			}
		});

		repositionResizer();
	};

	var columnResizeHandler = function (event, ui) {
		var parent = $(this).closest('.Row');
		var prev = $(this).prev();
		var next = $(this).next();		
		var pw = 0,
			nw = 0;
		var nAll = next.nextAll('.Column');
		var pAll = prev.prevAll('.Column');
		nAll.each(function () {
		    nw = nw + (+$(this).outerWidth(false));
		});
		pAll.each(function () {
			pw = pw + $(this).outerWidth(false);
		});
		prev.outerWidth((ui.position.left) - pw +6);
		next.outerWidth((parent.width() - prev.outerWidth(false)) - nw - pw - 6);
	};


	$(document).ready(function(){
		initResizer();
		$(window).resize(function(){
			repositionResizer();
		});

		var resizeHandler = function () {
              var rElm = $('[resizeh]');
              var h = window.getWinSize()[1];              
              for (var i = 0; i < rElm.length; i++) {
                  rElm[i].style.height = (h - 183) + 'px';
                  rElm[i].style.overflow = 'auto';
              }
          };
		window.onload = resizeHandler;
		window.onresize = resizeHandler;
		window.getWinSize = function () {
		    if (window.innerWidth != undefined) {
		        return [window.innerWidth, window.innerHeight];
		    }
		    else {
		        var B = document.body,
                D = document.documentElement;
		        return [Math.max(D.clientWidth, B.clientWidth),
                Math.max(D.clientHeight, B.clientHeight)];
		    }
		}
	});
})(jQuery);