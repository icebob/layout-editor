$ ->

	# Create editor
	editor = new LayoutEditor $(".editor1"), {}, 
		showGrid: true

	# Editor event handlers
	editor.on "newObject", -> console.log "Editor event: newObject"

	editor.on "startResizing", (editor, dir) -> console.log "Editor event: startResizing", editor, dir
	editor.on "resizing", (editor, dx, dy) -> console.log "Editor event: resizing", editor, dx, dy
	editor.on "stopResizing", (editor) -> console.log "Editor event: stopResizing", editor

	editor.on "startMoving", (editor) -> console.log "Editor event: startMoving", editor
	editor.on "moving", (editor, dx, dy) -> console.log "Editor event: moving", editor, dx, dy
	editor.on "stopMoving", (editor) -> console.log "Editor event: stopMoving", editor

	editor.on "select", (editor, obj) -> console.log "Editor event: select", editor, obj
	editor.on "unselect", (editor, obj) -> console.log "Editor event: unselect", editor, obj

	# Create objects
	box1 = editor.createObject(20, 10, 50, 70, null, "red")
	box2 = editor.createObject(10, 10, 30, 50, box1, "green")
	box3 = editor.createObject(70, 70, 10, 10, null, "blue")
	box4 = editor.createObject(15, 45, 55, 30, null, "orange")	

	# Object event handlers
	$.each editor.objects, (i, obj) ->
		obj.on "render", (obj) -> console.log "Object event: render", obj
		obj.on "select", (obj) -> console.log "Object event: select", obj
		obj.on "unselect", (obj) -> console.log "Object event: unselect", obj

		obj.on "startMoving", (obj) -> console.log "Object event: startMoving", obj
		obj.on "applyMoving", (obj, dxp, dyp) -> console.log "Object event: applyMoving", obj, dxp, dyp
		obj.on "stopMoving", (obj) -> console.log "Object event: stopMoving", obj

		obj.on "startResizing", (obj) -> console.log "Object event: startResizing", obj
		obj.on "applyResizing", (obj, dxp, dyp, dir) -> console.log "Object event: applyResizing", obj, dxp, dyp, dir
		obj.on "stopResizing", (obj) -> console.log "Object event: stopResizing", obj

