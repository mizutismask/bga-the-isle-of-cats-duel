/** Types */
type Color = 'blue' | 'green' | 'red' | 'purple' | 'orange'
type XY = { x: number; y: number }
type Rect = { topX: number; topY: number; bottomX: number; bottomY: number }

/** Boat grid sizing */
const BOAT_TILE_BASE_TOP = 55 as const
const O_BOAT_TILE_WIDTH = 22
const I_BOAT_TILE_WIDTH = 21
//const BOAT_TILE_WIDTH = 22 as const
const BOATS_TILE_WIDTH: Record<BoatShape, number> = {
	OBoat: O_BOAT_TILE_WIDTH,
	IBoat: I_BOAT_TILE_WIDTH
}

const BOAT_TILE_HEIGHT = 9 as const

const BOATS_TILE_BASE_LEFT: Record<BoatShape, number> = {
	OBoat: 32,
	IBoat: 48
}
const BOAT_TILE_HEIGHT_PER_COLUMN: Record<BoatShape, readonly number[]> = {
	OBoat: [1, 7, 7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 7, 7, 7, 5, 5, 5, 3, 3, 1],
	IBoat: [7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 7, 7, 7, 5, 5, 3, 1, 1]
}

const BOAT_NB_MAP = 5 as const

/** Placement of the 5 colored icons on each boat color */
const BOAT_MAP_PLACEMENT: Readonly<Record<BoatShape, Readonly<Record<Color, XY>>>> = {
	OBoat: {
		blue: { x: 9, y: 7 },
		green: { x: 12, y: 2 },
		red: { x: 17, y: 5 },
		purple: { x: 3, y: 0 },
		orange: { x: 0, y: 4 }
	},
	IBoat: {
		blue: { x: 1, y: 6 },
		green: { x: 17, y: 4 },
		red: { x: 8, y: 7 },
		purple: { x: 3, y: 0 },
		orange: { x: 11, y: 1 }
	}
}
const BOAT_HOLES: Readonly<Record<BoatShape, XY[]>> = {
	OBoat: [
		{ x: 1, y: 2 },
		{ x: 1, y: 6 }
	],
	IBoat: [
		{ x: 0, y: 3 },
		{ x: 0, y: 4 },
		{ x: 0, y: 5 },
		{ x: 1, y: 3 },
		{ x: 1, y: 5 }
	]
}

/** Rat coordinates per boat color */
/*const BOAT_RAT_PLACEMENT: Record<BoatShape, XY[]> = {
	OBoat: [
		{ x: 1, y: 7 },
		{ x: 2, y: 6 },
		{ x: 2, y: 7 },
		{ x: 5, y: 2 },
		{ x: 5, y: 6 },
		{ x: 9, y: 2 },
		{ x: 6, y: 1 },
		{ x: 6, y: 2 },
		{ x: 6, y: 6 },
		{ x: 9, y: 8 },
		{ x: 11, y: 3 },
		{ x: 11, y: 4 },
		{ x: 12, y: 3 },
		{ x: 13, y: 2 },
		{ x: 13, y: 3 },
		{ x: 13, y: 6 },
		{ x: 13, y: 7 },
		{ x: 14, y: 6 },
		{ x: 17, y: 6 }
	],
	IBoat: [
		{ x: 1, y: 7 },
		{ x: 2, y: 6 },
		{ x: 2, y: 7 },
		{ x: 5, y: 2 },
		{ x: 5, y: 6 },
		{ x: 9, y: 2 },
		{ x: 6, y: 1 },
		{ x: 6, y: 2 },
		{ x: 6, y: 6 },
		{ x: 9, y: 8 },
		{ x: 11, y: 3 },
		{ x: 11, y: 4 },
		{ x: 12, y: 3 },
		{ x: 13, y: 2 },
		{ x: 13, y: 3 },
		{ x: 13, y: 6 },
		{ x: 13, y: 7 },
		{ x: 14, y: 6 }
	]
}*/

/** Room IDs (kept as constants for drop-in compatibility) */
const BOAT_ROOMS_ID_PARROT_BACK = 0 as const
const BOAT_ROOMS_ID_MOON_TOP = 1 as const
const BOAT_ROOMS_ID_MOON_BOTTOM = 2 as const
const BOAT_ROOMS_ID_APPLE_MIDDLE = 3 as const
const BOAT_ROOMS_ID_CORN_FRONT = 4 as const
const BOAT_ROOMS_ID_PARROT_FRONT = 5 as const

/** Room rectangles (inclusive coordinates) */
const BOAT_ROOMS_RECTANGLE: Readonly<Record<BoatShape, Rect[]>> = {
	OBoat: [
		// Back - Parrot
		{ topX: 0, topY: 1, bottomX: 2, bottomY: 7 },
		// Top - Moon
		{ topX: 3, topY: 0, bottomX: 9, bottomY: 1 },
		// Bottom - Moon
		{ topX: 3, topY: 7, bottomX: 9, bottomY: 8 },
		// Middle - Apple
		{ topX: 5, topY: 3, bottomX: 11, bottomY: 5 },
		// Front (large) - Corn
		{ topX: 16, topY: 2, bottomX: 19, bottomY: 6 },
		// Front (small) - Parrot
		{ topX: 20, topY: 3, bottomX: 21, bottomY: 5 }
	],
	IBoat: [
		// Back - Parrot
		{ topX: 1, topY: 3, bottomX: 4, bottomY: 5 },
		// Top - Moon
		{ topX: 0, topY: 0, bottomX: 4, bottomY: 2 },
		// Bottom - Moon
		{ topX: 0, topY: 6, bottomX: 4, bottomY: 8 },
		// Middle - Apple
		{ topX: 6, topY: 1, bottomX: 10, bottomY: 7 },
		// Front (large) - Corn
		{ topX: 14, topY: 1, bottomX: 16, bottomY: 7 },
		// Front (small) - Parrot
		{ topX: 17, topY: 2, bottomX: 20, bottomY: 6 }
	]
}

const BOAT_ROOMS_HOLES: Readonly<Record<BoatShape, Record<number, XY[]>>> = {
	OBoat: {
		[BOAT_ROOMS_ID_MOON_TOP]: [{ x: 3, y: 1 }],
		[BOAT_ROOMS_ID_MOON_BOTTOM]: [{ x: 3, y: 7 }],
		[BOAT_ROOMS_ID_PARROT_BACK]: [],
		[BOAT_ROOMS_ID_CORN_FRONT]: [],
		[BOAT_ROOMS_ID_PARROT_FRONT]: [],
		[BOAT_ROOMS_ID_APPLE_MIDDLE]: []
	},
	IBoat: {
		[BOAT_ROOMS_ID_MOON_TOP]: [
			{ x: 2, y: 2 },
			{ x: 3, y: 2 },
			{ x: 4, y: 2 }
		],
		[BOAT_ROOMS_ID_MOON_BOTTOM]: [
			{ x: 2, y: 6 },
			{ x: 3, y: 6 },
			{ x: 4, y: 6 }
		],
		[BOAT_ROOMS_ID_APPLE_MIDDLE]: [
			{ x: 6, y: 3 },
			{ x: 6, y: 4 },
			{ x: 6, y: 5 },
			{ x: 7, y: 3 },
			{ x: 7, y: 4 },
			{ x: 7, y: 5 },
			{ x: 9, y: 3 },
			{ x: 9, y: 4 },
			{ x: 9, y: 5 },
			{ x: 10, y: 3 },
			{ x: 10, y: 4 },
			{ x: 10, y: 5 }
		],
		[BOAT_ROOMS_ID_PARROT_BACK]: [],
		[BOAT_ROOMS_ID_CORN_FRONT]: [],
		[BOAT_ROOMS_ID_PARROT_FRONT]: []
	}
}

const SHAPE_COLOR_COUNTERS = ['blue', 'green', 'orange', 'purple', 'red', 'common']

class BoatMgr {
	private playersIds: string[]
	/** Root element selector for the current player's boat grid */
	private boatRootSel: string
	private game: TheIsleOfCatsDuelGame
	/** Mapping from shapeId to used grid cells */
	private used: Map<string, XY[]> = new Map()

	/** CSS class used to mark clickable cells */
	private clickableCls = 'tioc-clickable'

	// Try shapes
	private clientTryShapeBoatGridUsed = []
	private clientTryShapeShapeGridUsed = []
	// Current player
	private clientPlayerBoatGridUsed = []
	private clientPlayerShapeGridUsed = []
	// Server
	private serverBoatGridUsed = []
	private serverPlayerShapeGridUsed = []

	//private playerBoatColorName: {}
	private shapesHiddenPerPlayerId: Array<boolean> = []
	private placementShowGridOverlay: boolean = false
	private overlayButtonPressedBeforePlacing: boolean = false
	private overlayButtonChangedWhilePlacementShowGridOverlay: boolean = false
	private overlayButtonPressedPerPlayerId: Array<boolean> = []
	private playerShapeColorCounter = []

	constructor(game: TheIsleOfCatsDuelGame, boatRootSel = '#tioc-boat') {
		this.game = game
		this.boatRootSel = '#tioc-player-boat-' + this.game.getPlayerId()
	}

	public setup(gamedatas: TheIsleOfCatsDuelGamedatas) {
		this.playersIds = Object.keys(gamedatas.players)

		/** Builds tooltip HTML for legends */
		const tpl = {
			score: (d: any) => `
    <div class="tioc-legend-score">
      <ol>
        <li>1. ${d.rats} (-1)</li>
        <li>2. ${d.rooms} (-5)</li>
        <li>3. ${d.cat_families}</li>
        <li>5. ${d.your_lessons}</li>
      </ol>
      <ol>
        <li>3 = 8</li>
        <li>4 = 11</li>
        <li>5 = 15</li>
        <li>+1 = +5</li>
      </ol>
    </div>
  `,
			round: (d: any) => `
    <ol>
      <li>${d.title}</li>
      <li>${d.moveExtraSpace}</li>
      <li>${d.jump}</li>
      <li>${d.takeTreasure}</li>
      <li>${d.extraDiscovery}</li>
    </ol>
  `
		}

		const addLegendTooltip = (cls: string, key: keyof typeof tpl, data: any) =>
			this.game.gameui.addTooltipHtmlToClass(cls, tpl[key](data))

		addLegendTooltip('tioc-player-boat-legend-score', 'score', {
			rats: _('Rats'),
			rooms: _('Rooms'),
			cat_families: _('Cat Families'),
			your_lessons: _('Your Lessons')
		})

		addLegendTooltip('tioc-player-boat-legend-round', 'round', {
			title: _('Fish actions'),
			moveExtraSpace: _('1. Move one extra space'),
			jump: _('2. Jump anywhere'),
			takeTreasure: _('3. Take one treasure'),
			extraDiscovery: _('4. Choose one extra discovery')
		})

		const preventEvent = (event) => {
			event.preventDefault()
			event.stopPropagation()
			return false
		}
		for (const playerId in gamedatas.players) {
			//this.playerBoatColorName[playerId] = gamedatas.players[playerId].boat_color_name

			this.shapesHiddenPerPlayerId[playerId] = false
			const hideShapesButtonElem = document.getElementById('tioc-player-boat-hide-shapes-' + playerId)
			hideShapesButtonElem.innerText = _('Hide shapes')
			dojo.connect(hideShapesButtonElem, 'touchstart', (event) =>
				this.hideBoatPlayerShapes(hideShapesButtonElem, playerId)
			)
			dojo.connect(hideShapesButtonElem, 'mousedown', (event) =>
				this.hideBoatPlayerShapes(hideShapesButtonElem, playerId)
			)

			dojo.connect(hideShapesButtonElem, 'touchend', (event) =>
				this.showBoatPlayerShapes(hideShapesButtonElem, playerId)
			)
			dojo.connect(hideShapesButtonElem, 'mouseup', (event) =>
				this.showBoatPlayerShapes(hideShapesButtonElem, playerId)
			)
			dojo.connect(hideShapesButtonElem, 'mouseleave', (event) =>
				this.showBoatPlayerShapes(hideShapesButtonElem, playerId)
			)

			dojo.connect(hideShapesButtonElem, 'oncontextmenu', preventEvent)
			this.game.gameui.addTooltip(
				hideShapesButtonElem.id,
				'',
				_('Keep pressing to hide shapes that are on the boat and see the rooms hidden by the shapes')
			)

			this.overlayButtonPressedPerPlayerId[playerId] = false
			const hideOverlayButtonElem = document.getElementById('tioc-player-boat-hide-overlay-' + playerId)
			hideOverlayButtonElem.innerText = _('Room overlay')
			dojo.connect(hideOverlayButtonElem, 'onclick', (event) =>
				this.overlayButtonClicked(hideOverlayButtonElem, playerId)
			)
			dojo.connect(hideOverlayButtonElem, 'oncontextmenu', preventEvent)
			this.game.gameui.addTooltip(
				hideOverlayButtonElem.id,
				'',
				_('Enable to show the overlay that shows empty squares and room icons')
			)

			this.playerShapeColorCounter[playerId] = []
			const player = gamedatas.players[playerId]
			for (let i = 0; i < SHAPE_COLOR_COUNTERS.length; i++) {
				const colorCounter = SHAPE_COLOR_COUNTERS[i]
				const counterId = SHAPE_COLOR_COUNTERS_IDS[i]
				const elemId = 'tioc-player-panel-shape-face-' + colorCounter + '-' + playerId
				this.playerShapeColorCounter[playerId][colorCounter] = new ebg.counter()
				this.playerShapeColorCounter[playerId][colorCounter].create(elemId, {
					value: player[`shapes-${counterId}`],
					playerCounter: `shapes-${counterId}`,
					playerId: parseInt(player.id)
				})
			}
		}
	}

	private isBoatHole(x: number, y: number, boatShape: string) {
		return BOAT_HOLES[boatShape].some((hole) => hole.x === x && hole.y === y)
	}

	public setupForPlayer(playerId: string, boatShape: BoatShape, gamedatas: TheIsleOfCatsDuelGamedatas) {
		// Build grid for one boat
		let gridId = 0
		for (let x = 0; x < BOATS_TILE_WIDTH[boatShape]; ++x) {
			let baseY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]) / 2
			for (let y = 0; y < BOAT_TILE_HEIGHT; ++y) {
				const isValidGrid =
					y >= baseY &&
					y < baseY + BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x] &&
					!this.isBoatHole(x, y, boatShape)
				const jstpl_shape_grid = `<div class="tioc-grid x_${x}_y_${y}" id="tioc-grid-id-${gridId++}" data-x="${x}" data-y="${y}" data-valid-grid="${isValidGrid}" style="left: ${
					BOATS_TILE_BASE_LEFT[boatShape] + x + x * TILE_SIZE
				}px; top: ${BOAT_TILE_BASE_TOP + y + y * TILE_SIZE}px;"></div>`
				let boatElem = document.querySelector<HTMLElement>(
					`#player-table-${playerId} .tioc-player-boat:not(.temp-boat)`
				)
				dojo.place(jstpl_shape_grid, boatElem)

				const jstpl_shape_grid_small = `<div class="tioc-grid x_${x}_y_${y}" id="tioc-grid-id-${gridId++}" data-x="${x}" data-y="${y}" data-valid-grid="${isValidGrid}" style="left: ${
					x + x * SMALL_TILE_SIZE
				}px; top: ${+y + y * SMALL_TILE_SIZE}px;"></div>`
				const miniature = document.querySelector<HTMLElement>(
					`#overall_player_board_${playerId} .tioc-player-panel-boat-container`
				)
				dojo.place(jstpl_shape_grid_small, miniature)
			}
		}

		// Build array of used and unused boat grid for current player
		if (playerId == this.game.getPlayerId().toString()) {
			this.clearBoatGridUsed(this.clientPlayerBoatGridUsed, boatShape)
			this.clearBoatGridUsed(this.clientTryShapeBoatGridUsed, boatShape)
		}

		this.serverBoatGridUsed[playerId] = []
		this.clearBoatGridUsed(this.serverBoatGridUsed[playerId], boatShape)
		this.serverPlayerShapeGridUsed[playerId] = []

		// Place each shape on boat
		for (const shape of gamedatas.shapes) {
			this.game.addKnownShape(shape)
			if (shape.shapeLocationId != SHAPE_LOCATION_ID_BOAT || shape.playerId != playerId) {
				continue
			}
			const gridElem = document.querySelector(
				'#tioc-player-boat-' + shape.playerId + ' .tioc-grid.x_' + shape.boatTopX + '_y_' + shape.boatTopY
			)
			this.game.createShapeElement(gridElem, shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId)
			this.applyTransformToShapeId(
				shape.shapeId,
				shape.boatRotation,
				shape.boatHorizontalFlip,
				shape.boatVerticalFlip
			)
		}

		this.updatePlayerPanelBoat(gamedatas.boatUsedGridColor, playerId)
	}

	/** Enable click on all available boat grid squares and call back with x,y. */
	allowPlaceShape = (cb: (x: number, y: number) => void): void => {
		document
			.querySelectorAll<HTMLElement>(
				'#tioc-player-boat-' + this.game.getPlayerId() + ' .tioc-grid[data-valid-grid="true"]'
			)
			.forEach((sq) => {
				sq.classList.add(this.clickableCls)
				this.game.addOnClick(sq, (ev) => {
					ev.preventDefault()
					const x = Number(sq.dataset.x || sq.getAttribute('data-x'))
					const y = Number(sq.dataset.y || sq.getAttribute('data-y'))
					log('allowPlaceShape click on', x, y)
					this.removeAllBoatClickable()
					cb(x, y)
				})
			})
	}

	/** Remove all click handlers/visuals from the boat. */
	removeAllBoatClickable = (): void => {
		document.querySelectorAll(`.${this.clickableCls}`).forEach((el) => el.classList.remove(this.clickableCls))
	}

	/** Move a shape node into the boat grid at x,y.
	 * @param shapeId - technical id, not html element id
	 */
	moveShapeToBoat = (playerId: number, shapeId: string, x: number, y: number, onEndAnim?: () => void): void => {
		log('moveShapeToBoat', playerId, shapeId, x, y)
		const node = document.getElementById('tioc-shape-id-' + shapeId)
		const target = document.querySelector<HTMLElement>(
			`${'#tioc-player-boat-' + playerId} .tioc-grid[data-x="${x}"][data-y="${y}"]`
		)
		log('node', node, 'target', target)
		if (!node || !target) return

		node.classList.remove('tioc-clickable')
		node.classList.remove('tioc-clickable-no-border')
		node.classList.remove('tioc-selected')
		this.game.removeAbsolutePosition(node.id) //for treasures in zones
		target.appendChild(node)
		if (typeof onEndAnim === 'function') onEndAnim()
	}

	/** Apply rotation/flip transform on a shape by id. */
	applyTransformToShapeId = (shapeId: string, rotation: number, flipH: boolean, flipV: boolean): void => {
		const node = document.getElementById('tioc-shape-id-' + shapeId)
		if (!node) return
		const transform = []
		const normalizedRot = this.game.normalizeRotation(rotation)
		if (normalizedRot == 90) {
			transform.push('translate(-50%, -50%) rotate(' + rotation + 'deg) translate(50%, -50%)')
		} else if (normalizedRot == 180 || normalizedRot == 0) {
			transform.push('rotate(' + rotation + 'deg)')
		} else if (normalizedRot == 270) {
			transform.push('translate(-50%, -50%) rotate(' + rotation + 'deg) translate(-50%, 50%)')
		}
		if (flipH) {
			transform.push('scaleX(-1)')
		}
		if (flipV) {
			transform.push('scaleY(-1)')
		}

		node.style.transform = transform.join(' ')
	}

	moveAndTransformShapeToBoat(playerId: number, shape) {
		this.game.addKnownShape(shape)
		// Note: does not create the shape, there are no use case
		const playerBoatElemId = 'tioc-player-boat-' + playerId
		log('moveAndTransformShapeToBoat', playerBoatElemId, shape)
		const shapeElem = document.getElementById('tioc-shape-id-' + shape.shapeId)
		// If the shape is already on the boat, the player placed it
		// so don't move it
		if (shapeElem.closest('#' + playerBoatElemId) !== null) {
			return
		}
		this.moveShapeToBoat(playerId, shape.shapeId, shape.boatTopX, shape.boatTopY, () => {
			this.applyTransformToShapeId(
				shape.shapeId,
				shape.boatRotation,
				shape.boatHorizontalFlip,
				shape.boatVerticalFlip
			)
		})
	}

	/** Mark grid squares used by a shape. */
	markGridUsed = (shapeId: string, x: number, y: number, tryShape = false): void => {
		const boatGridUsed = tryShape ? this.clientTryShapeBoatGridUsed : this.clientPlayerBoatGridUsed
		const shapeGridUsed = tryShape ? this.clientTryShapeShapeGridUsed : this.clientPlayerShapeGridUsed
		boatGridUsed[x][y] = true
		if (!(shapeId in shapeGridUsed)) {
			shapeGridUsed[shapeId] = []
		}
		shapeGridUsed[shapeId].push({ x: x, y: y })
		//this.updateCurrentPlayerTooltips();
	}

	/** Clear the used marks for a shape. */
	markGridUnused = (shapeId: string, tryShape = false): void => {
		let boatGridUsed = null
		let shapeGridUsed = null
		if (tryShape) {
			boatGridUsed = this.clientTryShapeBoatGridUsed
			shapeGridUsed = this.clientTryShapeShapeGridUsed
		} else {
			if (shapeId in this.clientPlayerShapeGridUsed) {
				boatGridUsed = this.clientPlayerBoatGridUsed
				shapeGridUsed = this.clientPlayerShapeGridUsed
			} else {
				boatGridUsed = this.serverBoatGridUsed[this.game.getPlayerId()]
				shapeGridUsed = this.serverPlayerShapeGridUsed[this.game.getPlayerId()]
			}
		}
		for (const grid of shapeGridUsed[shapeId]) {
			boatGridUsed[grid.x][grid.y] = false
		}
		const usedGrid = shapeGridUsed[shapeId]
		delete shapeGridUsed[shapeId]
		//this.updateCurrentPlayerTooltips();
		return usedGrid
	}

	isGridValidAndEmpty(x, y, boatShape) {
		if (x < 0 || x >= BOATS_TILE_WIDTH[boatShape]) {
			return false
		}
		const minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]) / 2
		const maxY = minY + BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]
		if (y < minY || y >= maxY) {
			return false
		}
		if (this.isBoatHole(x, y, boatShape)) {
			return false
		}
		if (this.clientTryShapeBoatGridUsed[x][y]) {
			return false
		}
		if (this.clientPlayerBoatGridUsed[x][y]) {
			return false
		}
		if (this.serverBoatGridUsed[this.game.getPlayerId()][x][y]) {
			return false
		}
		return true
	}

	isBoatEmpty() {
		return (
			this.clientTryShapeBoatGridUsed.every((row) => row.every((cell) => !cell)) &&
			this.clientPlayerBoatGridUsed.every((row) => row.every((cell) => !cell)) &&
			this.serverBoatGridUsed[this.game.getPlayerId()].every((row) => row.every((cell) => !cell))
		)
	}

	/** Returns true if the grid cell x,y matches provided color name. */
	gridMapMatchesColor = (x: number, y: number, colorName: string): boolean => {
		const sq = document.querySelector<HTMLElement>(`${this.boatRootSel} .tioc-grid[data-x="${x}"][data-y="${y}"]`)
		if (!sq) return false
		return sq.classList.contains(`color-${colorName}`)
	}

	/** Paint a color id onto a shape (oshax). */
	placeColorIdOnShapeId = (shapeId: string, colorId: number | string): void => {
		const node = document.getElementById(shapeId)
		if (!node) return
		;['blue', 'green', 'red', 'purple', 'orange'].forEach((c) => node.classList.remove(`oshax-${c}`))
		node.classList.add(`oshax-${colorId}`)
	}

	isGridEmpty(x, y, boatShape) {
		if (x < 0 || x >= BOATS_TILE_WIDTH[boatShape]) {
			return true
		}
		const minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]) / 2
		const maxY = minY + BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]
		if (y < minY || y >= maxY) {
			return true
		}
		if (this.clientTryShapeBoatGridUsed[x][y]) {
			return false
		}
		if (this.clientPlayerBoatGridUsed[x][y]) {
			return false
		}
		if (this.serverBoatGridUsed[this.game.getPlayerId()][x][y]) {
			return false
		}
		return true
	}

	isPlayerGridEmpty(playerId, x, y) {
		if (playerId == this.game.getPlayerId()) {
			return this.isGridEmpty(x, y, this.getPlayerBoatShape(playerId))
		}
		if (x < 0 || x >= BOATS_TILE_WIDTH[this.getPlayerBoatShape(playerId)]) {
			return true
		}
		const boatShape = this.getPlayerBoatShape(playerId)
		const minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]) / 2
		const maxY = minY + BOAT_TILE_HEIGHT_PER_COLUMN[boatShape][x]
		if (y < minY || y >= maxY) {
			return true
		}
		return !this.serverBoatGridUsed[playerId][x][y]
	}

	isPlayerBoatEmpty(playerId) {
		const shapes = document.querySelectorAll('#tioc-player-boat-' + playerId + ' .tioc-shape')
		for (const shape of Array.from(shapes)) {
			if (shape.classList.contains('tioc-hidden') || shape.classList.contains('tioc-animate-to-hidden-end')) {
				continue
			}
			return false
		}
		return true
	}

	hideBoatPlayerShapes = (hideShapesButtonElem: HTMLElement, playerId: string): void => {
		//;(window.tiocWrap ?? ((_, fn) => fn()))('hideBoatPlayerShapes', () => {
		hideShapesButtonElem.classList.add('pressed')
		document
			.querySelectorAll(`#tioc-player-boat-${playerId} .tioc-shape`)
			.forEach((el) => el.classList.add('tioc-shape-fade-out'))
		this.shapesHiddenPerPlayerId[playerId] = true
		this.updateGridOverlay()
		//})
	}

	/** Show all shapes on a player's boat. */
	showBoatPlayerShapes = (hideShapesButtonElem: HTMLElement, playerId: string): void => {
		//;(window.tiocWrap ?? ((_, fn) => fn()))('showBoatPlayerShapes', () => {
		hideShapesButtonElem.classList.remove('pressed')
		document
			.querySelectorAll(`#tioc-player-boat-${playerId} .tioc-shape`)
			.forEach((el) => el.classList.remove('tioc-shape-fade-out'))
		this.shapesHiddenPerPlayerId[playerId] = false
		this.updateGridOverlay()
		//})
	}

	/** Toggle overlay visibility for a player. */
	overlayButtonClicked = (hideOverlayButtonElem: HTMLElement, playerId: string): void => {
		//;(window.tiocWrap ?? ((_, fn) => fn()))('overlayButtonPressed', () => {
		hideOverlayButtonElem.classList.toggle('pressed')
		const curr = !!this.overlayButtonPressedPerPlayerId[playerId]
		this.overlayButtonPressedPerPlayerId[playerId] = !curr
		if (String(playerId) === String(this.game.getPlayerId()) && this.placementShowGridOverlay) {
			this.overlayButtonChangedWhilePlacementShowGridOverlay = true
		}
		this.updateGridOverlay()
		//})
	}

	/** Force-show overlay while placing a shape. */
	showPlacementGridOverlay = (): void => {
		this.placementShowGridOverlay = true
		this.overlayButtonChangedWhilePlacementShowGridOverlay = false
		this.overlayButtonPressedBeforePlacing = !!this.overlayButtonPressedPerPlayerId[String(this.game.getPlayerId())]
		this.overlayButtonPressedPerPlayerId[String(this.game.getPlayerId())] = true
		const btn = document.getElementById(`tioc-player-boat-hide-overlay-${this.game.getPlayerId()}`)
		btn?.classList.add('pressed')
		this.updateGridOverlay()
	}

	/** Restore overlay button after placement. */
	hidePlacementGridOverlay = (): void => {
		if (this.placementShowGridOverlay && !this.overlayButtonChangedWhilePlacementShowGridOverlay) {
			this.overlayButtonPressedPerPlayerId[String(this.game.getPlayerId())] =
				this.overlayButtonPressedBeforePlacing
			const btn = document.getElementById(`tioc-player-boat-hide-overlay-${this.game.getPlayerId()}`)
			if (this.overlayButtonPressedPerPlayerId[String(this.game.getPlayerId())]) btn?.classList.add('pressed')
			else btn?.classList.remove('pressed')
		}
		this.placementShowGridOverlay = false
		this.overlayButtonChangedWhilePlacementShowGridOverlay = false
		this.updateGridOverlay()
	}

	/** Rescale all boats' grid positions. */
	rescale = (scaleOtherBoats: number, scalePlayerBoat: number): void => {
		for (const pid in this.playersIds) {
			const scale = String(pid) === String(this.game.getPlayerId()) ? scalePlayerBoat : scaleOtherBoats
			const grids = document.querySelectorAll<HTMLElement>(`#tioc-player-boat-${pid} .tioc-grid`)
			const boatShape = this.getPlayerBoatShape(pid)
			grids.forEach((grid) => {
				const x = parseInt(grid.dataset.x ?? '0', 10)
				const y = parseInt(grid.dataset.y ?? '0', 10)
				const x_px = ((BOATS_TILE_BASE_LEFT[boatShape] + x + x * TILE_SIZE) * scale) / 100
				const y_px = ((BOAT_TILE_BASE_TOP + y + y * TILE_SIZE) * scale) / 100
				grid.style.left = `${x_px}px`
				grid.style.top = `${y_px}px`
				const overlay = document.getElementById(`tioc-grid-overlay-${pid}-${x}-${y}`)
				if (overlay) {
					;(overlay as HTMLElement).style.left = `${x_px}px`
					;(overlay as HTMLElement).style.top = `${y_px}px`
				}
			})
		}
	}

	/** Reset a boolean occupancy grid to “unused”. */
	clearBoatGridUsed = (boatGridUsed: boolean[][], boatShape: BoatShape): void => {
		boatGridUsed.length = BOATS_TILE_WIDTH[boatShape]
		for (let x = 0; x < BOATS_TILE_WIDTH[boatShape]; x++) {
			boatGridUsed[x] = []
			boatGridUsed[x].length = BOAT_TILE_HEIGHT
			for (let y = 0; y < BOAT_TILE_HEIGHT; y++) boatGridUsed[x][y] = false
		}
	}

	/** Clear client-side try-shape markers. */
	clearTryShapes = (boatShape: BoatShape): void => {
		this.clearBoatGridUsed(this.clientTryShapeBoatGridUsed, boatShape)
		this.clientTryShapeShapeGridUsed = []
	}

	private getPlayerBoatShape(playerId: number | string): BoatShape {
		return this.game.gamedatas.players[playerId].boatShape
	}
	/** Build / refresh per-cell overlays on all boats. */
	updateGridOverlay = (playerId?: string): void => {
		for (const pid of this.playersIds) {
			if (playerId == null || pid == playerId) {
				const grids = document.querySelectorAll<HTMLElement>(
					`#tioc-player-boat-${pid} .tioc-grid[data-valid-grid="true"]`
				)
				grids.forEach((grid) => {
					const x = parseInt(grid.dataset.x ?? '0', 10)
					const y = parseInt(grid.dataset.y ?? '0', 10)
					let overlay = document.getElementById(`tioc-grid-overlay-${pid}-${x}-${y}`) as HTMLElement | null

					if (!overlay) {
						var jstpl_grid_overlay = `<div class="tioc-grid-overlay" id="tioc-grid-overlay-${pid}-${x}-${y}" data-x="${x}" data-y="${y}" style="left: ${grid.offsetLeft}px; top: ${grid.offsetTop}px;"></div>`

						// Create overlay from template and insert into the player's boat root
						document
							.getElementById(`tioc-player-boat-${pid}`)
							.insertAdjacentHTML('beforeend', jstpl_grid_overlay)
						overlay = document.getElementById(`tioc-grid-overlay-${pid}-${x}-${y}`)

						// Either place a map icon...
						let hasMap = false
						//const boatColor = this.playerBoatColorName[pid]
						const boatShape = this.getPlayerBoatShape(pid)
						const placement = BOAT_MAP_PLACEMENT[boatShape]
						for (const colorName in placement) {
							const p = placement[colorName as Color]
							if (p.x === x && p.y === y) {
								overlay?.insertAdjacentHTML('beforeend', `<div class="map-icon ${colorName}"></div>`)
								hasMap = true
								break
							}
						}
						// ...or a room icon if inside any room rect and not in a hole
						if (!hasMap && overlay) {
							for (let roomIndex = 0; roomIndex < BOAT_ROOMS_RECTANGLE[boatShape].length; roomIndex++) {
								const rect = BOAT_ROOMS_RECTANGLE[boatShape][roomIndex]
								const inZoneHole = BOAT_ROOMS_HOLES[boatShape][roomIndex].some(
									(h) => h.x === x && h.y === y
								)
								if (
									x >= rect.topX &&
									x <= rect.bottomX &&
									y >= rect.topY &&
									y <= rect.bottomY &&
									!inZoneHole
								) {
									switch (roomIndex) {
										case BOAT_ROOMS_ID_PARROT_BACK:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon parrot-back"></div>`
											)

											break
										case BOAT_ROOMS_ID_MOON_TOP:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon moon-top"></div>`
											)
											break
										case BOAT_ROOMS_ID_MOON_BOTTOM:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon moon-bottom"></div>`
											)
											break
										case BOAT_ROOMS_ID_APPLE_MIDDLE:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon apple"></div>`
											)
											break
										case BOAT_ROOMS_ID_CORN_FRONT:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon corn"></div>`
											)
											break
										case BOAT_ROOMS_ID_PARROT_FRONT:
											overlay.insertAdjacentHTML(
												'beforeend',
												`<div class="room-icon parrot-front"></div>`
											)
											break
									}
									break
								}
							}
						}
					}

					if (!overlay) return

					// Show/hide global overlay toggle
					if (this.overlayButtonPressedPerPlayerId[pid]) overlay.classList.remove('tioc-hidden')
					else overlay.classList.add('tioc-hidden')

					// Border classes depending on adjacency & hidden shapes
					if (this.isPlayerGridEmpty(pid, x, y) || this.shapesHiddenPerPlayerId[pid]) {
						overlay.classList.add('empty')
						overlay.classList.remove('top', 'bottom', 'left', 'right')
					} else {
						overlay.classList.remove('empty')
						this.isPlayerGridEmpty(pid, x, y - 1)
							? overlay.classList.add('top')
							: overlay.classList.remove('top')
						this.isPlayerGridEmpty(pid, x, y + 1)
							? overlay.classList.add('bottom')
							: overlay.classList.remove('bottom')
						this.isPlayerGridEmpty(pid, x - 1, y)
							? overlay.classList.add('left')
							: overlay.classList.remove('left')
						this.isPlayerGridEmpty(pid, x + 1, y)
							? overlay.classList.add('right')
							: overlay.classList.remove('right')
					}
				})
			}
		}
	}

	public allowSelectTreasure(onSelectFct) {
		const addOnClick = (shape) => {
			const shapeId = shape.dataset.shapeId
			let shapeGridUsed = null
			if (shapeId in this.clientPlayerShapeGridUsed) {
				shapeGridUsed = this.clientPlayerShapeGridUsed
			} else if (shapeId in this.serverPlayerShapeGridUsed[this.game.getPlayerId()]) {
				shapeGridUsed = this.serverPlayerShapeGridUsed[this.game.getPlayerId()]
			}
			if (shapeGridUsed === null) {
				return
			}
			shape.classList.add('tioc-clickable')
			for (const grid of shapeGridUsed[shapeId]) {
				const gridElem = document.querySelector(
					'#tioc-player-boat-' + this.game.getPlayerId() + ' .tioc-grid.x_' + grid.x + '_y_' + grid.y
				)
				this.game.addOnClick(gridElem, () => {
					this.removeAllBoatClickable()
					onSelectFct(shapeId)
				})
				gridElem.classList.add('tioc-clickable-no-border')
			}
		}
		let shapes = document.querySelectorAll(
			'#tioc-player-boat-' + this.game.getPlayerId() + ' .tioc-shape.shape-type-' + SHAPE_TYPE_ID_COMMON_TREASURE
		)
		for (const shape of Array.from(shapes)) {
			addOnClick(shape)
		}
	}
	public useShape(shapeId) {
		const shapeElemId = 'tioc-shape-id-' + shapeId
		dojo.addClass(shapeElemId, 'tioc-animate-to-hidden-start')
		setTimeout(() => {
			//window.tiocWrap('useShape_setTimeout', () => {
			dojo.addClass(shapeElemId, 'tioc-animate-to-hidden-end')
			//})
		}, 1)
		return this.markGridUnused(shapeId)
	}
	public unuseShape(shapeId, usedGrid) {
		if (shapeId === null) {
			return
		}
		const shapeElemId = 'tioc-shape-id-' + shapeId
		dojo.removeClass(shapeElemId, 'tioc-animate-to-hidden-start')
		dojo.removeClass(shapeElemId, 'tioc-animate-to-hidden-end')
		for (const grid of usedGrid) {
			this.markGridUsed(shapeId, grid.x, grid.y)
		}
	}
	public updatePlayerPanelBoat(boatUsedGridColor: Record<string, BoatCell[]>, playerId?: string) {
		const panelBoatGridElems = document.querySelectorAll('.tioc-player-panel-boat-container .tioc-grid')
		for (const gridElem of Array.from(panelBoatGridElems)) {
			gridElem.classList.remove('colorless')
			for (const colorName of CAT_COLOR_NAMES) {
				gridElem.classList.remove(colorName)
			}
		}
		for (const pId in boatUsedGridColor) {
			if (playerId == null || pId == playerId) {
				if (pId == this.game.getPlayerId().toString()) {
					this.clearBoatGridUsed(this.clientPlayerBoatGridUsed, this.getPlayerBoatShape(pId))
					this.clientPlayerShapeGridUsed = []
				}
				this.clearBoatGridUsed(this.serverBoatGridUsed[pId], this.getPlayerBoatShape(pId))
				this.serverPlayerShapeGridUsed[pId] = []
				const boatGridElems = document.querySelectorAll('.tioc-player-boat .tioc-grid')
				for (const gridElem of Array.from(boatGridElems)) {
					this.game.gameui.removeTooltip(gridElem.id)
				}

				for (const gridColor of boatUsedGridColor[pId]) {
					const x = gridColor.x
					const y = gridColor.y
					this.serverBoatGridUsed[pId][x][y] = true
					//log('serverBoatGridUsed', pId, x, y, ' true')
					if (!(gridColor.shapeId in this.serverPlayerShapeGridUsed[pId])) {
						this.serverPlayerShapeGridUsed[pId][gridColor.shapeId] = []
					}
					this.serverPlayerShapeGridUsed[pId][gridColor.shapeId].push({ x: x, y: y })
					const colorId = gridColor.colorId
					const gridElem = document.querySelector(
						'#tioc-player-panel-boat-container-' + pId + ' .tioc-grid.x_' + x + '_y_' + y
					)
					const shape = document.getElementById('tioc-shape-id-' + gridColor.shapeId)
					const boatGridElem = document.querySelector(
						'#tioc-player-boat-' + pId + ' .tioc-grid.x_' + x + '_y_' + y
					)
					/*log(
						'updatePlayerPanelBoat',
						'#tioc-player-boat-' + pId + ' .tioc-grid.x_' + x + '_y_' + y,
						boatGridElem
					)*/

					this.game.updateShapeElementTooltip(shape, boatGridElem.id)
					if (colorId === null) {
						gridElem.classList.add('colorless')
					} else {
						gridElem.classList.add(CAT_COLOR_NAMES[colorId])
					}
				}
				//debugger
			}
		}
		//this.updatePlayerPanelShapeCount()
		this.updateGridOverlay(playerId)
	}

	showScoreBoatPosition(playerId, scoreBoatPosition) {
		for (const pos of scoreBoatPosition) {
			const gridElem = document.querySelector<HTMLElement>(
				'#tioc-player-boat-' + playerId + ' .tioc-grid.x_' + pos.x + '_y_' + pos.y
			)
			this.game.displayBigScore(gridElem, playerId, pos.score)
		}
	}
}
