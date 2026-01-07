const COMMON_TREASURE_IDS = [100, 101, 102, 103]
class IslandMgr {
	private game: TheIsleOfCatsDuelGame
	private rootSel: string
	private clickableCls = 'tioc-clickable'
	/** Guard stacks for treasure allowances (so we can undo) */
	private allowCommonCount = 0
	private allowSmallCount = 0
	private allowRareCount = 0
	private commonTreasureZone = []
	public inAllowTryShapes = false

	constructor(game: TheIsleOfCatsDuelGame, rootSel = '#island') {
		this.game = game
		this.rootSel = rootSel
	}

	/**
	 * setup
	 */
	public setup(gamedatas: TheIsleOfCatsDuelGamedatas) {
		for (const shapeDefId of COMMON_TREASURE_IDS) {
			this.commonTreasureZone[shapeDefId] = new ebg.zone()
			this.commonTreasureZone[shapeDefId].create(
				this.game.gameui,
				'tioc-common-treasure-zone-' + shapeDefId,
				TILE_SIZE * 3,
				TILE_SIZE * 3
			)
			this.commonTreasureZone[shapeDefId].setPattern('diagonal')
		}

		//sort by shapeDefId
		/*	gamedatas.shapes.sort((a, b) => a.shapeId - b.shapeId)
		for (const shape of gamedatas.shapes) {
			log('shape', shape)
			this.game.createShapeElement('pieces', shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId)
		}*/
		for (const shape of gamedatas.shapes) {
			if (shape.shapeLocationId == SHAPE_LOCATION_ID_DISCARD) {
				continue
			}
			this.createAndPlaceShape(shape, false)
		}
	}
	/** Create a shape element and place it according to its location */
	public createAndPlaceShape(shape: Shape, animateFromIsland: boolean = true): void {
		this.game.addKnownShape(shape)
		const islandCreateId = 'tioc-island-discard'
		let location = ''
		let toCreate = false

		//debugger;
		switch (shape.shapeLocationId) {
			case SHAPE_LOCATION_ID_TABLE:
				switch (shape.shapeTypeId) {
					case SHAPE_TYPE_ID_COMMON_TREASURE: {
						const shapeElem = this.game.createShapeElement(
							'tioc-common-treasure-container',
							shape.shapeId,
							shape.shapeTypeId,
							shape.shapeDefId
						) as HTMLElement
						this.commonTreasureZone[shape.shapeDefId].placeInZone(shapeElem.id, shape.shapeId)

						break
					}
				}
				break

			case SHAPE_LOCATION_ID_ISLAND_CAT_SLOT:
				log('island shape', shape, location)
				const slot = document.querySelector(`.island-cat-slot-${shape.islandCatSlot}`)
				if (slot) {
					location = slot.id
					toCreate = true
				} else {
					log('island cat slot not found', shape)
				}
				break
			case SHAPE_LOCATION_ID_DISCARD:
			case SHAPE_LOCATION_ID_TO_PLACE:
				location = 'tioc-island-discard'
				toCreate = true
				break
			case SHAPE_LOCATION_ID_FIELD:
				location = 'tioc-round-counter-cats'
				toCreate = true
				break
		}
		if (toCreate) {
			this.game.createShapeElement(location, shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId)
		}

		//this.shapeSorter.schedule();
	}

	/** Let player pick a cat tile from the island; calls back with shapeId and price. */
	allowRescueCat = (cb: (shapeId: string, price: number) => void): void => {
		const root = document.querySelector(this.rootSel)
		if (!root) return
		root.querySelectorAll<HTMLElement>('.shape').forEach((el) => {
			el.classList.add(this.clickableCls)
			this.game.addOnClick(el, (ev) => {
				ev.preventDefault()
				const shapeId = el.id
				const price = Number(el.dataset.price || 0)
				this.removeAllIslandClickable()
				cb(shapeId, price)
			})
		})
	}

	/** Let player pick an oshax tile. */
	allowRescueOshax = (cb: (shapeId: string) => void): void => {
		const root = document.querySelector(this.rootSel)
		if (!root) return
		root.querySelectorAll<HTMLElement>('.shape.oshax').forEach((el) => {
			el.classList.add(this.clickableCls)
			this.game.addOnClick(el, (ev) => {
				ev.preventDefault()
				const shapeId = el.id
				this.removeAllIslandClickable()
				cb(shapeId)
			})
		})
	}

	/** Checks for stock on the island. */
	hasCommonTreasure = (): boolean => !!document.querySelector(`${this.rootSel} .shape.treasure.common`)
	hasRareTreasure = (): boolean => !!document.querySelector(`${this.rootSel} .shape.treasure.rare`)
	hasOshax = (): boolean => !!document.querySelector(`${this.rootSel} .shape.oshax`)

	/** Return a tile node back on the island (e.g., after undo). */
	moveShapeToIsland = (shapeId: string, _price?: number | null): void => {
		const node = document.getElementById(shapeId)
		const pool = document.querySelector(`${this.rootSel} .pool`) || document.querySelector(this.rootSel)
		if (node && pool) pool.appendChild(node)
	}

	/** Family mode helper to show only allowed cats. */
	allowFamilyRescueCat = (): void => {
		// Keep minimal; filtering handled server side and with CSS classes.
	}

	public allowTakeTreasure() {
		const shapes = document.querySelectorAll<HTMLElement>(
			'#tioc-common-treasure-container .tioc-shape.shape-type-2'
		)
		const shapeForShapeDefId = {}
		for (const shape of Array.from(shapes)) {
			this.game.addOnClick(shape, () => {
				shape.classList.add('tioc-selected')
				//this.removeAllIslandClickableClickOnly()
				this.game.actionMgr.takeCommonTreasure(shape.dataset.shapeId)
			})
		}
		//this.updateTopShapes()
	}

	public allowTakeToPlaceShape() {
		const shapes = document.querySelectorAll<HTMLElement>('.island-wrapper #tioc-island-discard .tioc-shape')
		for (const shape of Array.from(shapes)) {
			this.game.addOnClick(shape, () => {
				shape.classList.add('tioc-selected')
				//this.removeAllIslandClickableClickOnly()
				//this.game.anytimeActionMgr.takeToPlaceShape(shape.dataset.shapeId)

				this.game.boatMgr.allowPlaceShape((x, y) => {
					log('moveShapeToBoat')
					this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), shape.dataset.shapeId, x, y)
					const onConfirm = (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
						if (!this.game.tryShapesMgr.isInCmd) {
							this.game.takeAction('actMoveShapeToBoat', {
								shapeId: shapeId,
								x: x,
								y: y,
								rotation: rotation,
								flipH: flipH ? 1 : 0,
								flipV: flipV ? 1 : 0
							})
						}
					}
					this.game.shapeControl.attachToShapeId(shape.dataset.shapeId, x, y, onConfirm)
				})
			})
		}
		//this.updateTopShapes()
	}

	unlockShapeId = (shapeId: string): void => {
		const node = document.getElementById(shapeId)
		node?.classList.remove('locked')
	}

	/** Internal: enable click on a CSS selector of treasure tiles. */
	private _enableTreasureClicks = (selector: string): void => {
		const root = document.querySelector(this.rootSel)
		if (!root) return
		root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
			el.classList.add(this.clickableCls)
		})
	}

	disallowTryShapes() {
		this.inAllowTryShapes = false
	}
	allowTryShapes() {
		if (this.inAllowTryShapes) {
			return
		}
		const onClick = (shape) => {
			this.inAllowTryShapes = true
			this.removeAllIslandClickable()
			const shapeId = shape.dataset.shapeId + '-try-shapes'
			const shapeClone = shape.cloneNode()
			shapeClone.id += '-try-shapes'
			shapeClone.classList.add('tioc-try-shapes')
			shapeClone.classList.add('tioc-selected')
			shape.parentElement.insertBefore(shapeClone, shape)
			shape.classList.add('tioc-try-shapes-hidden')
			this.game.boatMgr.allowPlaceShape((x, y) => {
				this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), shapeId, x, y)
				this.game.shapeControl.attachToShapeId(
					shapeId,
					x,
					y,
					true /*canPutNextShapeAnywhere*/,
					(shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
						this.game.commandMgr.currentCommandStateValue().shapeList.push({
							shapeId: shape.dataset.shapeId,
							x: x,
							y: y,
							rotation: rotation,
							flipH: flipH,
							flipV: flipV,
							usedGrid: usedGrid
						})
						for (const grid of usedGrid) {
							this.game.boatMgr.markGridUsed(shape.dataset.shapeId, grid.x, grid.y, true)
						}
						this.game.boatMgr.updateGridOverlay()
						this.game.shapeControl.detach()
						this.disallowTryShapes()
						this.allowTryShapes()
						this.game.tryShapesMgr.updateButton()
					}
				)
			})
		}
		const shapes = document.querySelectorAll<HTMLElement>('.island-wrapper .tioc-shape')
		const shapeForShapeDefId = {}
		for (const shape of Array.from(shapes)) {
			if (shape.classList.contains('tioc-try-shapes-hidden')) {
				continue
			}
			const shapeId = shape.dataset.shapeId
			const shapeDefId = this.game.getShapeDefIdFromShapeId(shapeId)
			if (this.game.getShapeTypeIdFromShapeId(shapeId) == SHAPE_TYPE_ID_COMMON_TREASURE) {
				shapeForShapeDefId[shapeDefId] = shape
			} else {
				this.game.addOnClick(shape, () => onClick(shape))
			}
		}
		for (const shapeDefId in shapeForShapeDefId) {
			const shape = shapeForShapeDefId[shapeDefId]
			this.game.addOnClick(shape, () => onClick(shape))
		}
		//this.updateTopShapes()
	}
	removeAllIslandClickable() {
		const clickable = document.querySelectorAll('.island-wrapper .tioc-clickable')
		for (const c of Array.from(clickable)) {
			this.game.removeClickableId(c.id)
		}
		const selected = document.querySelectorAll('.island-wrapper .tioc-selected')
		for (const c of Array.from(selected)) {
			this.game.removeClickableId(c.id)
		}
		//this.updateTopShapes()
	}

	discardShapeId(shapeId) {
		const shapeElem = document.getElementById('tioc-shape-id-' + shapeId)
		if (shapeElem) {
			shapeElem.style.transform = ''
			shapeElem.classList.add('tioc-moving')
			this.game.animationManager.fadeOutAndDestroy(shapeElem)
			/*  shapeElem.classList.add('tioc-animate-to-hidden-start');
						// Remove cat color
						shapeElem.innerHTML = '';
						const destinationId = 'tioc-island-discard';
						this.game.slide(shapeElem.id, destinationId).then(() => {
							//window.tiocWrap('discardShapeId_onEnd', () => {
								this.game.tiocFadeOutAndDestroy(shapeElem.id, 1000);
								this.updateTopShapes();
							//});
						});*/
			//this.shapeSorter.schedule();
		}
	}
}
