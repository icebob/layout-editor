(function() {
  var $, Editor, Emitter, LayoutObject, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require("jquery");

  _ = require("lodash");

  Emitter = require("event-emitter");

  LayoutObject = require("./object");

  module.exports = Editor = (function() {
    Editor.prototype.changed = false;

    function Editor(c, layout1, options) {
      this.layout = layout1;
      this.options = options;
      this.saveLayout = bind(this.saveLayout, this);
      this.loadLayout = bind(this.loadLayout, this);
      this.clearLayout = bind(this.clearLayout, this);
      this.onPointerUp = bind(this.onPointerUp, this);
      this.onPointerMove = bind(this.onPointerMove, this);
      this.onPointerDown = bind(this.onPointerDown, this);
      this.prevent = bind(this.prevent, this);
      if (c === void 0) {
        throw new Error("Container is missing!");
      }
      if (this.layout === void 0) {
        throw new Error("Layout is missing!");
      }
      if (this.options == null) {
        this.options = {};
      }
      this.dom = $("<div/>").addClass("layout-editor").appendTo($(c));
      if (this.options.showGrid === true) {
        this.dom.addClass("grid");
      }
      this.objects = [];
      this.selected = [];
      this.dragging = false;
      this.resizing = false;
      this.moving = false;
      this.dom.on("mousedown touchstart", this.onPointerDown);
      this.dom.on("mousemove touchmove", this.onPointerMove);
      this.dom.on("mouseup touchend touchcancel", this.onPointerUp);
    }

    Editor.prototype.createObject = function(l, t, r, b, parent, styleClass) {
      var obj;
      obj = new LayoutObject(this, l, t, r, b, parent, styleClass);
      this.objects.push(obj);
      this.emit("newObject", this, obj);
      return obj;
    };

    Editor.prototype.clearSelections = function() {
      $.each(this.objects, (function(_this) {
        return function(i, obj) {
          return obj.unselect();
        };
      })(this));
      return this.selected = [];
    };

    Editor.prototype.isSelected = function(obj) {
      return this.selected.indexOf(obj) !== -1;
    };

    Editor.prototype.prevent = function(e) {
      e.preventDefault();
      return e.stopPropagation();
    };

    Editor.prototype.onPointerDown = function(e) {
      var obj, target;
      this.prevent(e);
      this.dragging = false;
      this.resizing = false;
      this.moving = false;
      target = $(e.target).closest(".layout-object");
      if (target.length > 0) {
        obj = target.data("obj");
        if (this.selected.length > 0) {
          $.each(this.objects, (function(_this) {
            return function(i, o) {
              if (o !== obj) {
                return o.unselect();
              }
            };
          })(this));
        }
        if (obj.selected !== true) {
          obj.select();
          this.selected = [obj];
        }
      } else {
        this.clearSelections();
      }
      this.emit("pointerDown", this);
      if (this.selected.length > 0) {
        this.dragging = true;
        if ($(e.target).hasClass("resize-helper")) {
          this.resizing = true;
          this.resizingHelper = $(e.target);
          this.emit("startResizing", this, this.resizingHelper.attr("direction"));
          $.each(this.selected, (function(_this) {
            return function(i, obj) {
              return obj.startResizing();
            };
          })(this));
        } else {
          this.dragging = true;
          this.moving = true;
          this.emit("startMoving", this);
          $.each(this.selected, (function(_this) {
            return function(i, obj) {
              return obj.startMoving();
            };
          })(this));
        }
        return this.startPos = {
          x: e.pageX,
          y: e.pageY
        };
      }
    };

    Editor.prototype.onPointerMove = function(e) {
      var dx, dy;
      this.prevent(e);
      if (this.dragging) {
        dx = e.pageX - this.startPos.x;
        dy = e.pageY - this.startPos.y;
        this.emit("pointerDown", this, dx, dy);
        if (this.moving) {
          this.emit("moving", this, dx, dy);
        } else if (this.resizing) {
          this.emit("resizing", this, dx, dy);
        }
        return $.each(this.selected, (function(_this) {
          return function(i, obj) {
            if (_this.moving) {
              obj.applyMoving(dx, dy);
            }
            if (_this.resizing) {
              return obj.applyResizing(_this.resizingHelper, dx, dy);
            }
          };
        })(this));
      }
    };

    Editor.prototype.onPointerUp = function(e) {
      this.prevent(e);
      if (this.dragging) {
        this.dragging = false;
        this.emit("pointerUp", this);
        if (this.moving) {
          this.moving = false;
          this.emit("stopMoving", this);
          $.each(this.selected, (function(_this) {
            return function(i, obj) {
              return obj.stopMoving();
            };
          })(this));
        }
        if (this.resizing) {
          this.resizing = false;
          this.emit("stopResizing", this);
          return $.each(this.selected, (function(_this) {
            return function(i, obj) {
              return obj.stopResizing();
            };
          })(this));
        }
      }
    };

    Editor.prototype.clearLayout = function() {
      var j, len, obj, ref;
      ref = this.objects;
      for (j = 0, len = ref.length; j < len; j++) {
        obj = ref[j];
        obj.destroy();
      }
      this.objects = [];
      return this.selected = [];
    };

    Editor.prototype.loadLayout = function() {
      return this.clearLayout();
    };

    Editor.prototype.saveLayout = function() {
      var obj;
      return (function() {
        var j, len, ref, results;
        ref = this.objects;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          obj = ref[j];
          results.push($.extend({}, obj));
        }
        return results;
      }).call(this);
    };

    return Editor;

  })();

  if ((window.jQuery == null) && ($ != null)) {
    window.jQuery = $;
  }

  if (window.jQuery) {
    window.jQuery.fn.layoutEditor = function(layout, opts) {
      return $(this).each(function() {
        var editor;
        editor = new Editor($(this), layout, opts);
        return $(this).data("layout-editor", editor);
      });
    };
  }

  Emitter(Editor.prototype);

  window.LayoutEditor = Editor;

}).call(this);
