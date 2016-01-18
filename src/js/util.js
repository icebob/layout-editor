(function() {
  var $, _;

  $ = require("jquery");

  _ = require("lodash");

  module.exports = {
    createHelpers: function(dom) {
      dom.append($("<div/>").attr("direction", "n").addClass("resize-helper rh-n"));
      dom.append($("<div/>").attr("direction", "s").addClass("resize-helper rh-s"));
      dom.append($("<div/>").attr("direction", "e").addClass("resize-helper rh-e"));
      dom.append($("<div/>").attr("direction", "w").addClass("resize-helper rh-w"));
      dom.append($("<div/>").attr("direction", "ne").addClass("resize-helper rh-ne"));
      dom.append($("<div/>").attr("direction", "se").addClass("resize-helper rh-se"));
      dom.append($("<div/>").attr("direction", "nw").addClass("resize-helper rh-nw"));
      return dom.append($("<div/>").attr("direction", "sw").addClass("resize-helper rh-sw"));
    }
  };

}).call(this);
