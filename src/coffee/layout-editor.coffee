$					= require "jquery"
_					= require "lodash"
Emitter				= require "event-emitter"

LayoutObject 		= require "./object"

# --- LAYOUT EDITOR MAIN CLASS ---	
module.exports = class Editor

	changed: false

	constructor: (c, @layout, @options) ->	
		# Validation
		if c is undefined then throw new Error("Container is missing!")
		if @layout is undefined then throw new Error("Layout is missing!")
		unless @options?
			@options = {} # Create an empty options

		# DOM element
		@dom = $("<div/>").addClass("layout-editor").appendTo $(c)

		if @options.showGrid is true then @dom.addClass "grid"

		# Properties
		@objects = [] 
		@selected = []

		@dragging = false
		@resizing = false
		@moving = false

		# Event handlers
		@dom.on "mousedown touchstart", @onPointerDown
		@dom.on "mousemove touchmove", @onPointerMove
		@dom.on "mouseup touchend touchcancel", @onPointerUp

	# Add new object
	createObject: (l, t, r, b, parent, styleClass) ->
		obj = new LayoutObject @, l, t, r, b, parent, styleClass
		@objects.push obj

		@emit "newObject", @, obj

		return obj

	# Clear selected objects
	clearSelections: () ->
		$.each @objects, (i, obj) => obj.unselect()				
		@selected = []
			
	# Check if object is selected
	isSelected: (obj) -> @selected.indexOf(obj) isnt -1
		
	# Prevent an event
	prevent: (e) =>
		e.preventDefault()
		e.stopPropagation()			
		
	# Start dragging or resizing
	onPointerDown: (e) => 
		@prevent e
		
		@dragging = false
		@resizing = false
		@moving = false
		
		target = $(e.target).closest ".layout-object"
		if target.length > 0
			obj = target.data "obj"			

			if @selected.length > 0 
				$.each @objects, (i, o) => o.unselect()	if o isnt obj

			if obj.selected isnt true
				obj.select()
				@selected = [obj]

		else 
			@clearSelections()

		@emit "pointerDown", @
		
		if @selected.length > 0
			@dragging = true
			if $(e.target).hasClass "resize-helper"
				# Átméretezés
				#console.log "Resizing"
				@resizing = true
				@resizingHelper = $(e.target)
				@emit "startResizing", @, @resizingHelper.attr("direction")
				$.each @selected, (i, obj) => obj.startResizing()


			else
				# Mozgatás
				#console.log "Moving"
				@dragging = true
				@moving = true
				@emit "startMoving", @
				$.each @selected, (i, obj) => obj.startMoving()

			@startPos = 
				x: e.pageX
				y: e.pageY
		
	# Dragging or resizing
	onPointerMove: (e) => 
		@prevent e
		if @dragging
			# Calculate moving
			dx = e.pageX - @startPos.x
			dy = e.pageY - @startPos.y

			@emit "pointerDown", @, dx, dy
			if @moving
				@emit "moving", @, dx, dy
			else if @resizing
				@emit "resizing", @, dx, dy

			$.each @selected, (i, obj) =>	
				if @moving
					obj.applyMoving dx, dy
				
				if @resizing
					obj.applyResizing @resizingHelper, dx, dy

	
	# Stop dragging or resizing
	onPointerUp: (e) => 
		@prevent e
		
		if @dragging
			@dragging = false
			@emit "pointerUp", @

			if @moving
				@moving = false
				@emit "stopMoving", @
				$.each @selected, (i, obj) => obj.stopMoving()
			
			if @resizing
				@resizing = false
				@emit "stopResizing", @
				$.each @selected, (i, obj) => obj.stopResizing()


	clearLayout: () =>
		for obj in @objects
			obj.destroy()

		@objects = []
		@selected = []

	loadLayout: () =>
		@clearLayout()


	saveLayout: () => return ($.extend {}, obj for obj in @objects)


# jQuery plugin registration
if not window.jQuery? and $? then window.jQuery = $ # under testing
if window.jQuery
	window.jQuery.fn.layoutEditor = (layout, opts)->
		return $(@).each -> 
			editor = new Editor $(@), layout, opts
			$(@).data("layout-editor", editor)

Emitter Editor.prototype

window.LayoutEditor = Editor