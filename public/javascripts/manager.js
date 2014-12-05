(function(root){
  "use strict"
  if (typeof root.matrix == "undefined") { root.matrix = {}; }

  root.matrix.numberWithCommas = function(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };


  var templateStrings = {};

  var template =
  root.matrix.template =
  function(node, id, context){
    var templ = templateStrings[id];
    if (!templ) {
       templateStrings[id] = templ = document.getElementById(id).textContent;
    }
    node.innerHTML = Mustache.render(templ, context);
  };

  var def = function(o, p, v) {
    Object.defineProperty(o, p, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: v,
    });
  }

  def(HTMLElement.prototype, "prepend", function(e) {
    if(this.childNodes.length) {
      this.insertBefore(e, this.firstChild);
    } else {
      this.appendChild(e);
    }
    return this;
  });
  def(HTMLElement.prototype, "append", function(e) {
    this.appendChild(e);
    return this;
  });
  def(HTMLElement.prototype, "remove", function(e) {
    this.removeChild(e);
    return this;
  });

  def(HTMLElement.prototype, "maxChildren", function(count) {
    var c = this.children;
    if (c.length < count) return;
    while(c.length > count) { this.removeChild(c[c.length-1]); }
  });

  var setElementProperties = function(e, args) {
    Object.keys(args).forEach(function(key) {
      switch(key) {
        case "innerHTML":
          e.innerHTML = args.innerHTML; break;
        case "className":
          e.setAttribute("class", args.className); break;
        case "classList":
          args.classList.forEach(function(cn) { e.classList.add(cn); });
          break;
        case "children":
          args.children.forEach(function(child) {
            e.appendChild(child);
          });
          break;
        default:
          e.setAttribute(key, args[key]);
          break;
      }
    });
  };

  var makeElement = function(en, args) {
    var e = document.createElement(en);
    if(args) { setElementProperties(e, args); }
    return e;
  };

  ["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "del", "details", "dfn", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"].forEach(function(en) {
    def(HTMLElement.prototype, en, makeElement.bind(document, en));
  });

  def(HTMLElement.prototype, "template", function(id, context) {
    template(this, id, context);
    return this;
  });

  var animationDuration = 500;
  var animateDownBy = function(elements, height) {
    var start = Date.now();
    var prev = start;
    var last = 0;
    var lasty = 0;
    var _animateDownBy = function() {
      var now = Date.now();
      var dt = now - start;
      var x = Math.min(dt / animationDuration, 1);
      var y = Bezier.cubicBezier(0.4, 0, 0.2, 1, x, animationDuration);
      var topDelta = (y - lasty) * height;
      elements.forEach(function(e) {
        var t = parseFloat(e.style.top);
        e.style.top = (t+topDelta)+"px";
      });
      var prev = now;
      lasty = y;
      if (dt <= animationDuration) {
        window.requestAnimationFrame(_animateDownBy);
      }
    };
    window.requestAnimationFrame(_animateDownBy);
  };

  var manager =
  root.matrix.manager = {
    animationDuration: 500,
    init: function(){
      var body = document.body;
      if(body.offsetWidth < body.offsetHeight){
        body.classList.add('tall');
      }
      matrix.traffic.init();
      matrix.landing.init();
      matrix.search.init();
      matrix.content.init();
    },
    animateInto: function(element, column, limit) {
      // Insert the element into the bottom of the column to calculate
      // dimensions, then remove.
      var width = 0;
      var height = 0;

      element.style.opacity = 0;
      element.style.position = "absolute";
      element.style.left = "0px";
      element.style.top = "0px";
      column.prepend(element);
      // get layout at next rAF
      window.requestAnimationFrame(function() {
        column.maxChildren(limit);

        width = element.offsetWidth;
        height = element.offsetHeight;

        // Position
        element.style.opacity = null;
        element.style.top = -height + "px";

        // Now grab all of the elements and schedule them to slide down
        var elements = [].slice.call(column.children, 0);
        animateDownBy(elements, height);
      });
    },
  };

}).call(this, this);
