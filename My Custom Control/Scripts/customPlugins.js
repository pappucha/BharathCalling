//query string parser
(function ($) {
    $.QueryString = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

//css string parser
(function ($) {
    $.CssParser = function (css) {
        var doc = document.implementation.createHTMLDocument(""),
            styleElement = document.createElement("style");

        styleElement.textContent = 'body{'+css+'}';
        doc.body.appendChild(styleElement);
        return styleElement.sheet.cssRules;
    }
})(jQuery);