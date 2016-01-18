(function() {
  var $, Emitter, LayoutObject, _, util;

  $ = require("jquery");

  _ = require("lodash");

  Emitter = require("event-emitter");

  util = require("./util");

  module.exports = LayoutObject = (function() {
    LayoutObject.prototype.changed = false;

    function LayoutObject(editor, l, t, r, b, parent, styleClass) {
      this.editor = editor;
      this.parent = parent;
      this.styleClass = styleClass;
      this.pos = {
        left: l,
        top: t,
        right: r,
        bottom: b
      };
      this.dom = null;
      this.selected = false;
      this.parentDom = this.parent ? this.parent.dom : this.editor.dom;
      this.render();
    }

    LayoutObject.prototype.setCss = function() {
      return this.dom.css({
        left: this.pos.left + "%",
        top: this.pos.top + "%",
        width: this.getWidth() + "%",
        height: this.getHeight() + "%"
      });
    };

    LayoutObject.prototype.render = function() {
      if (this.dom == null) {
        this.dom = $("<div/>").addClass("layout-object");
        if (this.styleClass != null) {
          this.dom.addClass(this.styleClass);
        }
        this.dom.data("obj", this);
        this.dom.append($("<span/>"));
        util.createHelpers(this.dom);
        this.dom.appendTo(this.parentDom);
      }
      this.setCss();
      return this.emit("render", this);
    };

    LayoutObject.prototype.select = function() {
      if (this.selected !== true) {
        this.selected = true;
        this.dom.addClass("selected");
        this.editor.emit("select", this.editor, this);
        return this.emit("select", this);
      }
    };

    LayoutObject.prototype.unselect = function() {
      if (this.selected) {
        this.selected = false;
        this.dom.removeClass("selected");
        this.editor.emit("unselect", this.editor, this);
        return this.emit("unselect", this);
      }
    };

    LayoutObject.prototype.startMoving = function() {
      this.dom.addClass("moving");
      this.savePos();
      this.dom.find("> span").text("X: " + this.pos.left + "%, Y: " + this.pos.top + "%");
      return this.emit("startMoving", this);
    };

    LayoutObject.prototype.stopMoving = function() {
      this.dom.removeClass("moving");
      return this.emit("stopMoving", this);
    };

    LayoutObject.prototype.startResizing = function() {
      this.dom.addClass("resizing");
      this.savePos();
      this.dom.find("> span").text("W: " + (this.getWidth()) + "%, H: " + (this.getHeight()) + "%");
      return this.emit("startResizing", this);
    };

    LayoutObject.prototype.stopResizing = function() {
      this.dom.removeClass("resizing");
      return this.emit("stopResizing", this);
    };

    LayoutObject.prototype.savePos = function() {
      this.origPos = this.pos;
      this.origPos.width = this.getWidth;
      return this.origPos.height = this.getHeight;
    };

    LayoutObject.prototype.percentW = function(x) {
      return Math.round(x * 100.0 / this.parentDom.width());
    };

    LayoutObject.prototype.percentH = function(y) {
      return Math.round(y * 100.0 / this.parentDom.height());
    };

    LayoutObject.prototype.checkLimits = function(v) {
      return Math.max(Math.min(100, v), 0);
    };

    LayoutObject.prototype.getWidth = function() {
      return 100 - this.pos.right - this.pos.left;
    };

    LayoutObject.prototype.getHeight = function() {
      return 100 - this.pos.bottom - this.pos.top;
    };

    LayoutObject.prototype.applyMoving = function(dx, dy) {
      var dxp, dyp, newPos;
      dxp = this.percentW(dx);
      dyp = this.percentH(dy);
      newPos = {
        left: this.origPos.left + dxp,
        top: this.origPos.top + dyp,
        right: this.origPos.right - dxp,
        bottom: this.origPos.bottom - dyp
      };
      this.pos = this.checkBorders(newPos);
      this.render();
      this.dom.find("> span").text("X: " + this.pos.left + "%, Y: " + this.pos.top + "%");
      return this.emit("applyMoving", this, dxp, dyp);
    };

    LayoutObject.prototype.applyResizing = function(resizingHelper, dx, dy) {
      var dir, dxp, dyp, newPos;
      dxp = this.percentW(dx);
      dyp = this.percentH(dy);
      newPos = $.extend({}, this.origPos);
      dir = resizingHelper.attr("direction");
      switch (dir) {
        case "n":
          newPos.top += dyp;
          break;
        case "e":
          newPos.right -= dxp;
          break;
        case "s":
          newPos.bottom -= dyp;
          break;
        case "w":
          newPos.left += dxp;
          break;
        case "ne":
          newPos.top += dyp;
          newPos.right -= dxp;
          break;
        case "se":
          newPos.bottom -= dyp;
          newPos.right -= dxp;
          break;
        case "nw":
          newPos.top += dyp;
          newPos.left += dxp;
          break;
        case "sw":
          newPos.bottom -= dyp;
          newPos.left += dxp;
      }
      this.pos = this.checkBorders(newPos);
      this.render();
      this.dom.find("> span").text("W: " + (this.getWidth()) + "%, H: " + (this.getHeight()) + "%");
      return this.emit("applyResizing", this, dxp, dyp, dir);
    };

    LayoutObject.prototype.checkBorders = function(newPos) {
      if (newPos.left < 0) {
        newPos.left = 0;
        newPos.right = 100 - this.getWidth();
      }
      if (newPos.top < 0) {
        newPos.top = 0;
        newPos.bottom = 100 - this.getHeight();
      }
      if (newPos.right < 0) {
        newPos.right = 0;
        newPos.left = 100 - this.getWidth();
      }
      if (newPos.bottom < 0) {
        newPos.bottom = 0;
        newPos.top = 100 - this.getHeight();
      }
      return newPos;
    };

    return LayoutObject;

  })();

  Emitter(LayoutObject.prototype);

  window.LayoutObject = LayoutObject;

}).call(this);
