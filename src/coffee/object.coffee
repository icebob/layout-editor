$					= require "jquery"
_					= require "lodash"
Emitter				= require "event-emitter"

util				= require "./util"

# --- LAYOUT OBJECT CLASS ---	
module.exports = class LayoutObject

	changed: false

	constructor: (@editor, l, t, r, b, @parent, @styleClass) -> 
		@pos = 
			left: l
			top: t
			right: r
			bottom: b
			
		@dom = null
		@selected = false
		@parentDom = if @parent then @parent.dom else @editor.dom
		@render()
	
	# set coordinates in CSS
	setCss: ->
		@dom.css
			left: @pos.left + "%"
			top: @pos.top + "%"			
			width: @getWidth() + "%"
			height: @getHeight() + "%"
	
	# refresh object in DOM
	render: () ->
		if not @dom?
			@dom = $("<div/>").addClass("layout-object")
			@dom.addClass @styleClass if @styleClass?
			@dom.data "obj", @
			@dom.append $("<span/>")
			util.createHelpers @dom
			@dom.appendTo @parentDom
		
		@setCss()	
		@emit "render", @
	
	select: () ->
		if @selected isnt true
			@selected = true
			@dom.addClass "selected"

			@editor.emit "select", @editor, @
			@emit "select", @
		
	unselect: () ->
		if @selected
			@selected = false
			@dom.removeClass "selected"

			@editor.emit "unselect", @editor, @
			@emit "unselect", @
	
	startMoving: () -> 
		@dom.addClass "moving"
		@savePos()
		@dom.find("> span").text "X: #{@pos.left}%, Y: #{@pos.top}%"
		@emit "startMoving", @
		
	stopMoving: () -> 
		@dom.removeClass "moving"
		@emit "stopMoving", @

	startResizing: () -> 
		@dom.addClass "resizing"
		@savePos()
		@dom.find("> span").text "W: #{@getWidth()}%, H: #{@getHeight()}%"
		@emit "startResizing", @
		
	stopResizing: () -> 
		@dom.removeClass "resizing"
		@emit "stopResizing", @
	
	savePos: () ->
		@origPos = @pos
		@origPos.width = @getWidth
		@origPos.height = @getHeight

	percentW: (x) -> Math.round x  * 100.0 / @parentDom.width()
	percentH: (y) -> Math.round y  * 100.0 / @parentDom.height()
	checkLimits: (v) -> Math.max(Math.min(100, v), 0)
	getWidth: () -> 100 - @pos.right - @pos.left
	getHeight: () -> 100 - @pos.bottom - @pos.top
	
	# Mozgatás érvényesítése
	applyMoving: (dx, dy) ->
		dxp = @percentW dx
		dyp = @percentH dy
		
		newPos = 
			left: @origPos.left + dxp
			top: @origPos.top + dyp
			right: @origPos.right - dxp
			bottom: @origPos.bottom - dyp
			
		@pos = @checkBorders newPos
		@render()

		@dom.find("> span").text "X: #{@pos.left}%, Y: #{@pos.top}%"
		@emit "applyMoving", @, dxp, dyp


	# Átméretezés érvényesítése
	applyResizing: (resizingHelper, dx, dy) ->
		dxp = @percentW dx
		dyp = @percentH dy
		
		newPos = $.extend {}, @origPos
		dir = resizingHelper.attr("direction")
		switch dir 
			when "n" then newPos.top += dyp
			when "e" then newPos.right -= dxp
			when "s" then newPos.bottom -= dyp
			when "w" then newPos.left += dxp

			when "ne" 
				newPos.top += dyp
				newPos.right -= dxp
			when "se" 
				newPos.bottom -= dyp
				newPos.right -= dxp
			when "nw" 
				newPos.top += dyp
				newPos.left += dxp
			when "sw" 
				newPos.bottom -= dyp
				newPos.left += dxp
			
		@pos = @checkBorders newPos
		@render()

		@dom.find("> span").text "W: #{@getWidth()}%, H: #{@getHeight()}%"
		@emit "applyResizing", @, dxp, dyp, dir
		
	# Határok ellenőrzése, hogy ne lépje túl
	checkBorders: (newPos) ->
		if newPos.left < 0
			newPos.left = 0
			newPos.right = 100 - @getWidth()
			
		if newPos.top < 0
			newPos.top = 0
			newPos.bottom = 100 - @getHeight()

		if newPos.right < 0
			newPos.right = 0
			newPos.left = 100 - @getWidth()

		if newPos.bottom < 0
			newPos.bottom = 0
			newPos.top = 100 - @getHeight()		
		
		return newPos



Emitter LayoutObject.prototype

window.LayoutObject = LayoutObject