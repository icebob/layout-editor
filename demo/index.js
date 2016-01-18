$(function() {
  var box1, box2, box3, box4, editor;
  editor = new LayoutEditor($(".editor1"), {}, {
    showGrid: true
  });
  editor.on("newObject", function() {
    return console.log("Editor event: newObject");
  });
  editor.on("startResizing", function(editor, dir) {
    return console.log("Editor event: startResizing", editor, dir);
  });
  editor.on("resizing", function(editor, dx, dy) {
    return console.log("Editor event: resizing", editor, dx, dy);
  });
  editor.on("stopResizing", function(editor) {
    return console.log("Editor event: stopResizing", editor);
  });
  editor.on("startMoving", function(editor) {
    return console.log("Editor event: startMoving", editor);
  });
  editor.on("moving", function(editor, dx, dy) {
    return console.log("Editor event: moving", editor, dx, dy);
  });
  editor.on("stopMoving", function(editor) {
    return console.log("Editor event: stopMoving", editor);
  });
  editor.on("select", function(editor, obj) {
    return console.log("Editor event: select", editor, obj);
  });
  editor.on("unselect", function(editor, obj) {
    return console.log("Editor event: unselect", editor, obj);
  });
  box1 = editor.createObject(20, 10, 50, 70, null, "red");
  box2 = editor.createObject(10, 10, 30, 50, box1, "green");
  box3 = editor.createObject(70, 70, 10, 10, null, "blue");
  box4 = editor.createObject(15, 45, 55, 30, null, "orange");
  return $.each(editor.objects, function(i, obj) {
    obj.on("render", function(obj) {
      return console.log("Object event: render", obj);
    });
    obj.on("select", function(obj) {
      return console.log("Object event: select", obj);
    });
    obj.on("unselect", function(obj) {
      return console.log("Object event: unselect", obj);
    });
    obj.on("startMoving", function(obj) {
      return console.log("Object event: startMoving", obj);
    });
    obj.on("applyMoving", function(obj, dxp, dyp) {
      return console.log("Object event: applyMoving", obj, dxp, dyp);
    });
    obj.on("stopMoving", function(obj) {
      return console.log("Object event: stopMoving", obj);
    });
    obj.on("startResizing", function(obj) {
      return console.log("Object event: startResizing", obj);
    });
    obj.on("applyResizing", function(obj, dxp, dyp, dir) {
      return console.log("Object event: applyResizing", obj, dxp, dyp, dir);
    });
    return obj.on("stopResizing", function(obj) {
      return console.log("Object event: stopResizing", obj);
    });
  });
});
