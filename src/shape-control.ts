/** Handles rotation/flip/drag confirmation of a placed shape. */
class ShapeControl {
	private game: TheIsleOfCatsDuelGame
	private shapeId: string
	private x: number
	private y: number
	private rotation: number = 0
	private flipH: boolean
	private flipV: boolean
	/*	onConfirm: (
			shapeId: string,
			x: number,
			y: number,
			rotation: number,
			flipH: boolean,
			flipV: boolean,
			usedGrid: XY[]
		) => void*/

	constructor(game: TheIsleOfCatsDuelGame) {
		this.game = game
	}

	public attachToShapeId(
		shapeId:string,
		x:number,
		y:number,
		onConfirmFunction: (
			shapeId: string,
			x: number,
			y: number,
			rotation: number,
			flipH: boolean,
			flipV: boolean,
			usedGrid: any[]
		) => void
	) {
		this.detach() //detach any previous selection
		this.shapeId = shapeId
		this.x = x
		this.y = y
		// Attach to shape only when the shape has finished moving
		const timer = setInterval(() => {
			const shapeElement = this._shapeElement()
			if (!shapeElement.classList.contains('tioc-moving')) {
				clearInterval(timer)
				this._attach(onConfirmFunction)
			}
		})
	}

	public _attach(
		onConfirmFunction: (
			shapeId: string,
			x: number,
			y: number,
			rotation: number,
			flipH: boolean,
			flipV: boolean,
			usedGrid: any[]
		) => void
	) {
		const shapeElement = this._shapeElement()
		const gridElement = shapeElement.parentNode as HTMLElement
		const topElement = gridElement.parentNode as HTMLElement
		shapeElement.remove()

		/** Template for shape controls */
		const jstpl_shape_controls = `
<div id="tioc-shape-controls">
  <div id="tioc-shape-controls-shape"></div>
  <div id="tioc-shape-controls-container">

    ${['left', 'right', 'down', 'flip-h', 'flip-v', 'rotate-cw', 'rotate-ccw']
		.map(
			(id) => `
        <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-${id}">
          <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-${id}"></div>
        </div>`
		)
		.join('')}

    <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-up">
		<div class="end-placement-container">
			<div class="bgabutton bgabutton_blue end-placement-button" id="tioc-shape-control-button-confirm"><i class="fa fa6 fa6-solid fa6-check"></i></div>
			<div class="bgabutton bgabutton_blue end-placement-button" id="tioc-shape-control-button-cancel"><i class="fa fa6 fa6-solid fa6-xmark"></i></div>
		</div>
      <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-up"></div>
    </div>

  </div>
</div>
`

		dojo.place(jstpl_shape_controls, topElement.id)
		this._shapeControlShapeElement().appendChild(shapeElement)
		const controlElement = this._shapeControlElement()
		controlElement.style.top = gridElement.offsetTop + 'px'
		controlElement.style.left = gridElement.offsetLeft + 'px'
		this._applyTransform()
		const grids = topElement.querySelectorAll<HTMLElement>('.tioc-grid')
		grids.forEach((grid) => {
			grid.classList.add('tioc-clickable-no-border')
			this.game.addOnClick(grid, (event) => {
				event.preventDefault()
				log('_attach', grid.dataset.x, grid.dataset.y)
				this._moveToPosIfFar(parseInt(grid.dataset.x), parseInt(grid.dataset.y))
			})
		})

		dojo.query('#tioc-shape-control-arrow-left').connect('onclick', this._buildDirectionClicker({ x: -1, y: 0 }))
		dojo.query('#tioc-shape-control-arrow-right').connect('onclick', this._buildDirectionClicker({ x: 1, y: 0 }))
		dojo.query('#tioc-shape-control-arrow-up').connect('onclick', this._buildDirectionClicker({ x: 0, y: -1 }))
		dojo.query('#tioc-shape-control-arrow-down').connect('onclick', this._buildDirectionClicker({ x: 0, y: 1 }))
		dojo.query('#tioc-shape-control-arrow-flip-h').connect('onclick', this._buildFlipClicker(true))
		dojo.query('#tioc-shape-control-arrow-flip-v').connect('onclick', this._buildFlipClicker(false))
		dojo.query('#tioc-shape-control-arrow-rotate-cw').connect('onclick', this._buildRotateClicker(1))
		dojo.query('#tioc-shape-control-arrow-rotate-ccw').connect('onclick', this._buildRotateClicker(-1))
		dojo.query('#tioc-shape-control-button-confirm').connect('onclick', (event) => {
			event.preventDefault()
			if (!this._isPositionValid()) {
				if (this.game.boatMgr.isBoatEmpty()) {
					this.game.gameui.showMessage(_('Shapes must be inside the boat and cannot overlap'), 'error')
				} else {
					this.game.gameui.showMessage(
						_('Shapes must be inside the boat, cannot overlap and must touch existing shapes'),
						'error'
					)
				}
				return
			}
			const usedGrid = []
			this._forEachShapeGrid((x, y) => {
				usedGrid.push({ x: x, y: y })
			})
			onConfirmFunction(
				this.shapeId,
				this.x,
				this.y,
				this.game.normalizeRotation(this.rotation),
				this.flipH,
				this.flipV,
				usedGrid
			)
		})
		dojo.query('#tioc-shape-control-button-cancel').connect('onclick', (event) => {
			event.preventDefault()
			const shapeToReposition = this._shapeElement()
			const whereToPutBack = this._shapeElement().dataset.previousParent
			shapeToReposition.classList.remove('tioc-selected')
			//todo change status bar title
			this.detach()
			//this.game.islandMgr.moveShapeToIsland(state.shapeId, price)
			if (shapeToReposition && whereToPutBack) {
				document.getElementById(whereToPutBack).appendChild(shapeToReposition)
			}
			//onCancelFunction(this.shapeId)
		})
		const confirmButton = document.getElementById('tioc-shape-control-button-confirm')
		//confirmButton.innerText = _('Confirm')
		//const parent = confirmButton.parentNode as HTMLElement
		//confirmButton.style.left = Math.floor(parent.offsetWidth / 2 - confirmButton.offsetWidth / 2) + 'px'

		const cancelButton = document.getElementById('tioc-shape-control-button-cancel')
		//cancelButton.innerText = _('Cancel')
		//const parent = cancelButton.parentNode as HTMLElement
		//confirmButton.style.left = Math.floor(parent.offsetWidth / 2 - confirmButton.offsetWidth / 2) + 'px'
		//this.game.boatMgr.updateCurrentPlayerTooltips()
	}
	public detach() {
		const controlElem = this._shapeControlElement()
		if (controlElem === null) {
			//this.game.boatMgr.updateCurrentPlayerTooltips()
			this.game.boatMgr.hidePlacementGridOverlay()
			return
		}
		const shapeElement = this._shapeElement()
		controlElem.remove()
		const gridElem = this._gridElement(this.x, this.y)
		gridElem.appendChild(shapeElement)
		const topElement = gridElem.parentNode
		const grids = topElement.querySelectorAll<HTMLElement>('.tioc-grid')
		grids.forEach((grid) => {
			this.game.removeClickable(grid)
		})

		this.shapeId = null
		this.x = null
		this.y = null
		this.rotation = 0
		this.flipH = false
		this.flipV = false
		//this.game.boatMgr.updateCurrentPlayerTooltips()
		this.game.boatMgr.hidePlacementGridOverlay()
	}
	public _shapeControlElement() {
		return document.getElementById('tioc-shape-controls')
	}
	public _shapeControlShapeElement() {
		return document.getElementById('tioc-shape-controls-shape')
	}
	public _shapeControlContainerElement() {
		return document.getElementById('tioc-shape-controls-container')
	}
	public _shapeControlConfirmButton() {
		return document.getElementById('tioc-shape-control-button-confirm')
	}
	public _shapeControlCancelButton() {
		return document.getElementById('tioc-shape-control-button-cancel')
	}
	public _shapeElementId() {
		return 'tioc-shape-id-' + this.shapeId
	}
	public _shapeElement() {
		return document.getElementById(this._shapeElementId())
	}
	public _gridElement(x, y) {
		return document.querySelector<HTMLElement>(
			'#tioc-player-boat-' + this.game.getPlayerId() + ' .tioc-grid.x_' + x + '_y_' + y
		)
	}
	public _applyTransform() {
		const shapeElement = this._shapeElement()
		const maxShapeSize = Math.max(shapeElement.offsetWidth, shapeElement.offsetHeight)
		this.game.applyTransformToElement(shapeElement, this.rotation, this.flipH, this.flipV)

		const shapeContainerElement = this._shapeControlContainerElement()
		shapeContainerElement.style.width = shapeContainerElement.style.height = maxShapeSize + 'px'

		const button = this._shapeControlConfirmButton()
		button.classList.remove('bgabutton_blue')
		button.classList.remove('bgabutton_red')
		if (this._isPositionValid()) {
			button.classList.add('bgabutton_blue')
		} else {
			button.classList.add('bgabutton_red')
		}
	}
	public _moveTo(x, y) {
		let moveGridElem = this._gridElement(x, y)
		if (moveGridElem === null) {
			return
		}
		this.x = x
		this.y = y
		const controlElement = this._shapeControlElement()
		this._applyTransform()
		//if (this.game.gameui.isFastMode()) {
		this.game.changeParent(controlElement, controlElement.parentNode as HTMLElement, 'last')
		controlElement.style.top = moveGridElem.offsetTop + 'px'
		controlElement.style.left = moveGridElem.offsetLeft + 'px'
		/*	} else {
			const anim = this.game.slideToObjectPos(
				controlElement,
				controlElement.parentNode,
				moveGridElem.offsetLeft,
				moveGridElem.offsetTop
			)
			anim.play()
		}*/
	}
	public _moveToPosIfFar(x, y) {
		//window.tiocWrap('_moveToPosIfFar', () => {
		const shapeSize = this.game.getShapeSizeFromShapeId(this.shapeId)
		let nearX = false
		if (x <= this.x && this.x - x <= 1) {
			nearX = true
		} else if (x > this.x && x - (this.x + shapeSize.width) < 1) {
			nearX = true
		}
		let nearY = false
		if (y <= this.y && this.y - y <= 1) {
			nearY = true
		} else if (y > this.y && y - (this.y + shapeSize.height) < 1) {
			nearY = true
		}
		if (nearX && nearY) {
			return
		}
		this._moveTo(x, y)
		//})
	}
	public _buildDirectionClicker(movement) {
		return (event) => {
			//window.tiocWrap('_buildDirectionClicker', () => {
			event.preventDefault()
			let x = this.x
			let y = this.y
			x += movement.x
			y += movement.y
			if (x < 0) {
				return
			}
			if (y < 0) {
				return
			}
			this._moveTo(x, y)
			//})
		}
	}
	public _buildFlipClicker(isFlipH) {
		return (event) => {
			//window.tiocWrap('_buildFlipClicker', () => {
			event.preventDefault()
			let curIsFlipH = isFlipH
			const normalizedRot = this.game.normalizeRotation(this.rotation)
			if (normalizedRot == 90 || normalizedRot == 270) {
				curIsFlipH = !isFlipH
			}
			const flipH = curIsFlipH ? !this.flipH : this.flipH
			const flipV = curIsFlipH ? this.flipV : !this.flipV
			this.flipH = flipH
			this.flipV = flipV
			this._applyTransform()
			//})
		}
	}
	public _buildRotateClicker(direction) {
		return (event) => {
			event.preventDefault()
			let rotation = this._calculateRotation(this.rotation, 90 * direction)
			this.rotation = rotation
			this._applyTransform()
		}
	}
	public _calculateRotation(baseRotation, rotation) {
		rotation += baseRotation
		return rotation
	}
	public _forEachShapeGrid(gridFunction) {
		this.game.forEachShapeGrid(this.shapeId, this.x, this.y, this.rotation, this.flipH, this.flipV, gridFunction)
	}
	public _isPositionValid() {
		const boatEmpty = this.game.boatMgr.isBoatEmpty()
		let positionValid = true
		let touchesOtherShapes = false
		const boatShape = this.game.gamedatas.players[this.game.getPlayerId()].boatShape
		this._forEachShapeGrid((x, y) => {
			//debugger
			log('isGridValidAndEmpty', x, y, this.game.boatMgr.isGridValidAndEmpty(x, y, boatShape))
			if (!this.game.boatMgr.isGridValidAndEmpty(x, y, boatShape)) {
				positionValid = false
				return false
			}
			if (
				!boatEmpty &&
				(!this.game.boatMgr.isGridEmpty(x - 1, y, boatShape) ||
					!this.game.boatMgr.isGridEmpty(x + 1, y, boatShape) ||
					!this.game.boatMgr.isGridEmpty(x, y - 1, boatShape) ||
					!this.game.boatMgr.isGridEmpty(x, y + 1, boatShape))
			) {
				touchesOtherShapes = true
			}
			return true
		})
		if (!positionValid) {
			return false
		}
		if (boatEmpty) {
			return true
		}
		return touchesOtherShapes
	}
}
