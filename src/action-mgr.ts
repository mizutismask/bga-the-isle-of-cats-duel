interface CardTreasureType {
	CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON: number
	CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON: number
}

const ACTION_TYPE_ID_RESCUE_CARD = 0
const ACTION_TYPE_ID_RESCUE_BASKET = 1
const ACTION_TYPE_ID_COMMON_TREASURE = 2
const ACTION_TYPE_ID_OSHAX = 3
const ACTION_TYPE_ID_TREASURE_CARD = 4
const ACTION_TYPE_ID_RARE_TREASURE = 5
const ACTION_TYPE_ID_ANYTIME_CARD = 6
const ACTION_TYPE_ID_BUY_CARD = 7
const ACTION_TYPE_ID_TO_PLACE_SHAPE = 8
const ACTION_TYPE_ID_UNBUY_CARD = 9
const ACTION_TYPE_ID_RESCUE_FAMILY = 11
/********************
 * ActionMgr.ts
 ********************/
class ActionMgr {
	/** Action type enums kept for undo/redo semantics. */

	private game: TheIsleOfCatsDuelGame
	private rescueCardHalfBasketFct: ((cardId: string) => void) | null = null

	/** ctor */
	constructor(game: TheIsleOfCatsDuelGame) {
		this.game = game
	}

	/** Show a color picker dialog (cats/oshax). */
	showColorDialog = (
		choice: (colorId: string | null) => void,
		options: Partial<Record<'blue' | 'green' | 'red' | 'purple' | 'orange', string>> = {}
	) => {
		this.game.closeAllTooltips()
		const dlg = new ebg.popindialog()
		dlg.create('tioc-color-choice-dialog')
		dlg.setTitle(_('Choose a color:'))
		dlg.setContent(
			this.game.gameui.format_string_recursive(
				'<div class="tioc-color-choice-list">' +
					'   <div>' +
					'      <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat blue" data-color-id="0"></div>' +
					'      <div>${blue_count}</div>' +
					'   </div>' +
					'   <div>' +
					'      <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat green" data-color-id="1"></div>' +
					'      <div>${green_count}</div>' +
					'   </div>' +
					'   <div>' +
					'      <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat red" data-color-id="2"></div>' +
					'      <div>${red_count}</div>' +
					'   </div>' +
					'   <div>' +
					'      <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat purple" data-color-id="3"></div>' +
					'      <div>${purple_count}</div>' +
					'   </div>' +
					'   <div>' +
					'      <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat orange" data-color-id="4"></div>' +
					'      <div>${orange_count}</div>' +
					'   </div>' +
					'</div>',
				{
					blue_count: options.blue || '',
					green_count: options.green || '',
					red_count: options.red || '',
					purple_count: options.purple || '',
					orange_count: options.orange || ''
				}
			)
		)
		dlg.replaceCloseCallback(() => {
			dlg.destroy()
			choice(null)
		})
		dlg.show()

		const meeples = document.querySelectorAll<HTMLElement>('.tioc-color-choice-list .tioc-clickable')
		let singleClick = false
		meeples.forEach((m) => {
			const colorId = m.dataset.colorId!
			this.game.addOnClick(m, (ev) => {
				if (singleClick) return
				singleClick = true
				ev.preventDefault()
				dlg.destroy()
				choice(colorId)
			})
		})
	}

	/** Small treasure VS any common */
	showSmallTreasureDialog = (choice: (isSmall: boolean | null) => void) => {
		this.game.closeAllTooltips()
		const dlg = new ebg.popindialog()
		dlg.create('tioc-small-treasure-dialog')
		dlg.setTitle(_('Small or any common treasure:'))
		dlg.setContent(
			'<div class="tioc-small-treasure-list">' +
				'   <div class="tioc-clickable tioc-small-treasure-list-choice" data-is-small="true">' +
				'      <div class="tioc-shape shape-type-2 shape-def-100"></div>' +
				'      <div class="tioc-shape shape-type-2 shape-def-101"></div>' +
				'   </div>' +
				'   <div class="tioc-clickable tioc-small-treasure-list-choice" data-is-small="false">' +
				'      <div class="tioc-pay-fish"></div>' +
				'      <div class="tioc-shape shape-type-2 shape-def-100"></div>' +
				'      <div class="tioc-shape shape-type-2 shape-def-101"></div>' +
				'      <div class="tioc-shape shape-type-2 shape-def-102"></div>' +
				'      <div class="tioc-shape shape-type-2 shape-def-103"></div>' +
				'   </div>' +
				'</div>'
		)
		dlg.replaceCloseCallback(() => {
			dlg.destroy()
			choice(null)
		})
		dlg.show()
		document.querySelectorAll<HTMLElement>('.tioc-small-treasure-list .tioc-clickable').forEach((el) => {
			this.game.addOnClick(el, (ev) => {
				ev.preventDefault()
				dlg.destroy()
				choice(el.dataset.isSmall === 'true')
			})
		})
	}

	/** Buy a card (Explore). */
	buyCard = (cardId: string) => {
		/*const cmd = this.game.commandMgr
		if (cmd.isInCommand()) {
			this.game.gameui.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error')
			return
		}
		const price = this.game.cardMgr.getCardPriceFromCardId(cardId)
		const state = { actionTypeId: this.ACTION_TYPE_ID_BUY_CARD, cardId, colorId: null as null | string }
		cmd.startCommand(state)
		cmd.addValidation(
			_('You do not have enough fish to buy this card'),
			() => this.game.fishMgr.currentPlayerFishCount() >= price
		)
		cmd.addSimple(
			() => {
				this.game.fishMgr.useCurrentPlayerFish(price)
				this.game.cardMgr.moveCurrentPlayerCardToHand(cardId)
				// optional: allow buy/unbuy buttons refresh
			},
			() => {
				this.game.fishMgr.useCurrentPlayerFish(-price)
				this.game.cardMgr.moveCurrentPlayerCardToBuy(cardId)
			}
		)
		if (this.game.cardMgr.cardNeedsBuyColorFromCardId(cardId)) {
			cmd.add(
				(cont, err) => {
					cmd.changeTitle(_('${you} must select a color for the card'))
					this.showColorDialog((colorId) => {
						if (colorId === null) return err()
						state.colorId = colorId
						this.game.cardMgr.addColorToCardId(cardId, colorId)
						cont(colorId)
					})
				},
				(colorId: string) => this.game.cardMgr.addColorToCardId(cardId, colorId),
				() => this.game.cardMgr.removeColorFromCardId(cardId)
			)
		}
		cmd.endCommand()*/
	}

	/** Undo a buy. */
	unbuyCard = (cardId: string) => {
		/*const cmd = this.game.commandMgr
		if (cmd.isInCommand()) {
			this.game.gameui.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error')
			return
		}
		const price = this.game.cardMgr.getCardPriceFromCardId(cardId)
		const colorId = (this.game.cardMgr as any).getCurrentColorIdFromCardId?.(cardId)
		const state = { actionTypeId: this.ACTION_TYPE_ID_UNBUY_CARD, cardId }
		cmd.startCommand(state)
		cmd.addSimple(
			() => {
				this.game.cardMgr.removeColorFromCardId(cardId)
				this.game.cardMgr.moveCurrentPlayerCardToBuy(cardId)
			},
			() => {
				this.game.cardMgr.moveCurrentPlayerCardToHand(cardId)
				if (colorId != null) this.game.cardMgr.addColorToCardId(cardId, colorId)
			}
		)
		cmd.endCommand()*/
	}

	/** Play a Rescue card. */
	/*playRescueCard = (cardId: string) => {
		if (this.game.cardMgr.isCardUsed(cardId)) return // double-click safety
		if (
			this.game.phase45Mgr.canTakeCommonTreasure() ||
			this.game.phase45Mgr.canTakeRareTreasure() ||
			this.game.phase45Mgr.canTakeSmallTreasure()
		) {
			this.game.showMessage(_('You must place the allowed treasures first'), 'error')
			return
		}
		const basketType = this.game.cardMgr.getCardBasketTypeIdFromCardId(cardId)
		const cmd = this.game.commandMgr
		if (cmd.isInCommand()) {
			if (this.rescueCardHalfBasketFct && basketType === this.game.cardMgr.CARD_BASKET_TYPE_ID_HALF) {
				this.rescueCardHalfBasketFct(cardId)
				return
			}
			this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error')
			return
		}
		if (basketType === null) {
			this.game.showMessage(_('You cannot rescue cats with this card'), 'error')
			return
		}
		if (!this.game.phase45Mgr.canRescueCat()) {
			this.game.showMessage(_('You have already rescued all allowed cats on your turn'), 'error')
			return
		}

		const state: any = {
			actionTypeId: this.ACTION_TYPE_ID_RESCUE_CARD,
			firstCardId: cardId,
			secondCardId: null,
			shapeId: null,
			x: null,
			y: null,
			rotation: null,
			flipH: null,
			flipV: null
		}
		cmd.startCommand(state)
		cmd.addSimple(
			() => this.game.cardMgr.useCard(cardId),
			() => {
				this.game.cardMgr.unuseCard(cardId)
				this.game.islandMgr.removeAllIslandClickable()
				this.game.boatMgr.removeAllBoatClickable()
			}
		)

		if (basketType === this.game.cardMgr.CARD_BASKET_TYPE_ID_HALF) {
			cmd.add(
				(cont) => {
					cmd.changeTitle(_('${you} must select another half basket card'))
					this.rescueCardHalfBasketFct = (secondId: string) => {
						this.rescueCardHalfBasketFct = null
						state.secondCardId = secondId
						this.game.cardMgr.useCard(secondId)
						cont()
					}
				},
				() => this.game.cardMgr.useCard(state.secondCardId),
				() => {
					this.game.cardMgr.unuseCard(state.secondCardId)
					this.rescueCardHalfBasketFct = null
				}
			)
		}

		this._rescueCatEndCommand(cmd, state)
	}
*/
	/** Play a Basket token. */
	/*playBasket = (basketId: string) => {
		const cmd = this.game.commandMgr
		if (cmd.isInCommand())
			return this.game.showMessage(
				_('You must finish your current action (or undo) before you can do this'),
				'error'
			)
		if (this.game.basketMgr.isBasketUsed(basketId))
			return this.game.showMessage(_('This basket was already used'), 'error')
		if (!this.game.phase45Mgr.canRescueCat())
			return this.game.showMessage(_('You have already rescued all allowed cats on your turn'), 'error')
		if (
			this.game.phase45Mgr.canTakeCommonTreasure() ||
			this.game.phase45Mgr.canTakeRareTreasure() ||
			this.game.phase45Mgr.canTakeSmallTreasure()
		)
			return this.game.showMessage(_('You must place the allowed treasures first'), 'error')

		const state: any = {
			actionTypeId: this.ACTION_TYPE_ID_RESCUE_BASKET,
			basketId,
			shapeId: null,
			x: null,
			y: null,
			rotation: null,
			flipH: null,
			flipV: null
		}
		cmd.startCommand(state)
		cmd.addSimple(
			() => this.game.basketMgr.useBasket(basketId),
			() => {
				this.game.basketMgr.unuseBasket(basketId)
				this.game.islandMgr.removeAllIslandClickable()
				this.game.boatMgr.removeAllBoatClickable()
			}
		)
		this._rescueCatEndCommand(cmd, state)
	}*/

	public rescueCat(shapeId: string) {
		{
			const cmd = this.game.commandMgr
			/*if (cmd.isInCommand())
			return this.game.gameui.showMessage(
				_('You must finish your current action (or undo) before you can do this'),
				'error'
			)*
		
	/*	if (
			this.game.phase45Mgr.canTakeCommonTreasure() ||
			this.game.phase45Mgr.canTakeRareTreasure() ||
			this.game.phase45Mgr.canTakeSmallTreasure()
		)
			return this.game.showMessage(_('You must place the allowed treasures first'), 'error')*/

			const state: any = {
				actionTypeId: ACTION_TYPE_ID_RESCUE_BASKET,
				basketId: shapeId,
				shapeId: null,
				x: null,
				y: null,
				rotation: null,
				flipH: null,
				flipV: null
			}
			cmd.startCommand(state)
			cmd.addSimple(
				() => {},
				() => {
					this.game.islandMgr.removeAllIslandClickable()
					this.game.boatMgr.removeAllBoatClickable()
				}
			)
			this._rescueCatEndCommand(cmd, state, shapeId)
		}
	}

	/*public allowRescueCat() {
		const cmd = this.game.commandMgr
		const state: any = {
			actionTypeId: this.ACTION_TYPE_ID_TO_PLACE_SHAPE,
			basketId: null,
			shapeId: null,
			x: null,
			y: null,
			rotation: null,
			flipH: null,
			flipV: null
		}
		this.game.islandMgr.allowRescueCat((shapeId, price) => {
					cmd.changeTitle(_('${you} must select where to put the cat on your boat'))
					this.game.boatMgr.allowPlaceShape((x, y) => {
						state.shapeId = shapeId
						state.x = x
						state.y = y
						this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), shapeId, x, y)
					})
				})
	}*/
	/** Final portion shared by rescue flows. */
	public _rescueCatEndCommand = (cmd: CommandMgr, state: any, shapeId) => {
		cmd.add(
			(cont) => {
				cmd.changeTitle(_('${you} must select where to put the cat on your boat'))
				this.game.boatMgr.allowPlaceShape((x, y) => {
					state.shapeId = shapeId
					state.x = x
					state.y = y
					this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), shapeId, x, y)
					debugger
					cmd.add(
						(cont) => {
							cmd.changeTitle(_('${you} must confirm the position of the cat on your boat'))
							const canAnywhere = false
							debugger
							this.game.shapeControl.attachToShapeId(
								state.shapeId,
								state.x,
								state.y,
								canAnywhere,
								(shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
									debugger
									Object.assign(state, { shapeId, x, y, rotation, flipH, flipV })
									this.game.shapeControl.detach()
									let canTakeCommonTreasure = false
									const color = this.game.getShapeColorFromShapeId(shapeId)
									for (const g of usedGrid) {
										this.game.boatMgr.markGridUsed(state.shapeId, g.x, g.y)
										if (this.game.boatMgr.gridMapMatchesColor(g.x, g.y, color))
											canTakeCommonTreasure = true
									}
									this.game.boatMgr.updateGridOverlay()
									/*this.game.phase45Mgr.catRescued()
						if (canTakeCommonTreasure) this.game.phase45Mgr.allowTakeCommonTreasure()
						if (canAnywhere) this.game.phase45Mgr.takeNextShapeAnywhere()*/
									cont({ usedGrid, canTakeCommonTreasure, canPutNextShapeAnywhere: canAnywhere })
								}
							)
						},
						(info: any) => {
							this.game.boatMgr.applyTransformToShapeId(
								state.shapeId,
								state.rotation,
								state.flipH,
								state.flipV
							)
							for (const g of info.usedGrid) this.game.boatMgr.markGridUsed(state.shapeId, g.x, g.y)
							this.game.boatMgr.updateGridOverlay()
							/*this.game.phase45Mgr.catRescued()
				if (info.canTakeCommonTreasure) this.game.phase45Mgr.allowTakeCommonTreasure()
				if (info.canPutNextShapeAnywhere) this.game.phase45Mgr.takeNextShapeAnywhere()*/
						},
						(info: any) => {
							this.game.boatMgr.markGridUnused(state.shapeId)
							this.game.boatMgr.updateGridOverlay()
							/*this.game.phase45Mgr.undoCatRescued()
				if (info.canTakeCommonTreasure) this.game.phase45Mgr.undoAllowTakeCommonTreasure()
				if (info.canPutNextShapeAnywhere) this.game.phase45Mgr.undoTakeNextShapeAnywhere()*/
						}
					)
				})
			},
			(price: number) => {
				this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), state.shapeId, state.x, state.y)
			},
			(price: number) => {
				this.game.shapeControl.detach()
				this.game.islandMgr.moveShapeToIsland(state.shapeId, price)
			}
		)

		cmd.addSimple(
			() => this.game.islandMgr.removeAllIslandClickable(),
			() => {}
		)
		cmd.endCommand()
	}

	/** Take common treasure (or small/rare through helpers). */
	public takeCommonTreasure(shapeId: string) {
		if (this.game.gamedatas.gamestate.args.remainingTreasures < 1)
			return this.game.gameui.showMessage(_('You cannot take a treasure now'), 'error')

		const state: any = {
			ACTION_TYPE_ID_COMMON_TREASURE,
			shapeId,
			x: null,
			y: null,
			rotation: null,
			flipH: null,
			flipV: null
		}

		this.game.gameui.statusBar.setTitle(_('${you} must select where to put the treasure on your boat'))
		this.game.boatMgr.allowPlaceShape((x, y) => {
			this.game.removeAbsolutePosition(`tioc-shape-id-${shapeId}`)
			log('allowPlaceShape', shapeId, x, y)
			state.x = x
			state.y = y
			this.game.boatMgr.moveShapeToBoat(this.game.getPlayerId(), shapeId, x, y)
			this.game.gameui.statusBar.setTitle(_('${you} must confirm the position of the treasure on your boat'))

			const onConfirm = (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
				Object.assign(state, { shapeId, x, y, rotation, flipH, flipV })
				this.game.shapeControl.detach()
				for (const g of usedGrid) this.game.boatMgr.markGridUsed(state.shapeId, g.x, g.y)
				this.game.boatMgr.updateGridOverlay()
				this.game.boatMgr.markGridUnused(state.shapeId)

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

			this.game.shapeControl.attachToShapeId(
				state.shapeId,
				state.x,
				state.y,

				onConfirm
			)
		})
	}

	/** Treasure card flows */
	playTreasureCard = (cardId: string) => {
		/*if (this.game.cardsManager.isCardUsed(cardId)) return
		const cmd = this.game.commandMgr
		if (cmd.isInCommand())
			return this.game.gameui.showMessage(
				_('You must finish your current action (or undo) before you can do this'),
				'error'
			)
		if (
			this.game.phase45Mgr.canTakeCommonTreasure() 
		)
			return this.game.gameui.showMessage(_('You must place the allowed treasures first'), 'error')

		const state = {
			actionTypeId: this.ACTION_TYPE_ID_TREASURE_CARD,
			cardId,
			isSmallTreasure: null as null | boolean
		}
		switch (this.game.cardMgr.getCardTreasureTypeIdFromCardId(cardId)) {
			case (this.game.cardMgr as any).CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON:
				this._playTreasureCardOneRareTwoCommon(cardId, state)
				break
			
			default:
				this.game.gameui.showMessage(_('Invalid card'), 'error')
				break
		}*/
	}

	private _playTreasureCardOneRareTwoCommon = (cardId: string, state: any) => {
		const cmd = this.game.commandMgr
		cmd.startCommand(state)
		cmd.addValidation(
			_('There are no treasures left'),
			() => this.game.islandMgr.hasCommonTreasure() || this.game.islandMgr.hasRareTreasure()
		)
		cmd.addSimple(
			() => {
				//this.game.cardMgr.useCard(cardId)
				//this.game.phase45Mgr.allowTakeCommonTreasure()
			},
			() => {
				//this.game.cardMgr.unuseCard(cardId)
				//this.game.phase45Mgr.undoAllowTakeCommonTreasure()
			}
		)
		cmd.endCommand()
	}

	private _playTreasureCardTwoSmallTwoCommon = (cardId: string, state: any) => {
		/*const cmd = this.game.commandMgr
		cmd.startCommand(state)
		cmd.addValidation(_('There are no common treasures left'), () => this.game.islandMgr.hasCommonTreasure())
		cmd.addSimple(
			() => {
				this.game.cardMgr.useCard(cardId)
				this.game.phase45Mgr.playRareFinds()
			},
			() => {
				this.game.cardMgr.unuseCard(cardId)
				this.game.phase45Mgr.undoPlayRareFinds()
			}
		)
		cmd.add(
			(cont, err) => {
				cmd.changeTitle(_('${you} must choose to take small or common treasures'))
				this.showSmallTreasureDialog((isSmall) => {
					if (isSmall === null) return err()
					state.isSmallTreasure = isSmall
					if (isSmall) {
						this.game.phase45Mgr.allowTakeSmallTreasure()
						this.game.phase45Mgr.allowTakeSmallTreasure()
					} else {
						this.game.phase45Mgr.allowTakeCommonTreasure()
						this.game.phase45Mgr.allowTakeCommonTreasure()
						this.game.fishMgr.useCurrentPlayerFish(1)
					}
					cont()
				})
			},
			() => {
				if (state.isSmallTreasure) {
					this.game.phase45Mgr.allowTakeSmallTreasure()
					this.game.phase45Mgr.allowTakeSmallTreasure()
				} else {
					this.game.phase45Mgr.allowTakeCommonTreasure()
					this.game.phase45Mgr.allowTakeCommonTreasure()
					this.game.fishMgr.useCurrentPlayerFish(1)
				}
			},
			() => {
				if (state.isSmallTreasure) {
					this.game.phase45Mgr.undoAllowTakeSmallTreasure()
					this.game.phase45Mgr.undoAllowTakeSmallTreasure()
				} else {
					this.game.phase45Mgr.undoAllowTakeCommonTreasure()
					this.game.phase45Mgr.undoAllowTakeCommonTreasure()
					this.game.fishMgr.useCurrentPlayerFish(-1)
				}
			}
		)
		cmd.addValidation(
			_('You do not have enough fish to take common treasures'),
			() => this.game.fishMgr.currentPlayerFishCount() >= 0
		)
		cmd.endCommand()*/
	}
}
