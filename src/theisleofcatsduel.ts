/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TheIsleOfCatsDuel implementation : © Séverine Kamycki <mizutismask@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * theisleofcatsduel.ts
 *
 * TheIsleOfCatsDuel user interface script
 *
 * In this file, you are describing the logic of your user interface, in Typescript language.
 *
 */

const SHAPE_LOCATION_ID_BAG = 0
const SHAPE_LOCATION_ID_TABLE = 1
const SHAPE_LOCATION_ID_FIELD = 2
const SHAPE_LOCATION_ID_BOAT = 4
const SHAPE_LOCATION_ID_DISCARD = 5
const SHAPE_LOCATION_ID_TO_PLACE = 6
const SHAPE_LOCATION_ID_ISLAND_CAT_SLOT = 7

const SHAPE_TYPE_ID_CAT = 0
const SHAPE_TYPE_ID_COMMON_TREASURE = 2

const CAT_COLOR_NAMES = ['blue', 'green', 'red', 'purple', 'orange']
const CAT_COLOR_ID_BLUE = 0
const CAT_COLOR_ID_GREEN = 1
const CAT_COLOR_ID_RED = 2
const CAT_COLOR_ID_PURPLE = 3
const CAT_COLOR_ID_ORANGE = 4

const TILE_SIZE: number = 40
const SMALL_TILE_SIZE: number = 7

class TheIsleOfCatsDuel extends BaseGame implements TheIsleOfCatsDuelGame {
	public TILE_SIZE: 40
	public SMALL_TILE_SIZE: 7

	public cardsManager: CardsManager
	public jumpToManager: JumpToManager
	private originalTextChooseAction: string
	private island: Island
	public boatMgr: BoatMgr
	public islandMgr: IslandMgr
	public shapeControl: ShapeControl
	shapesCreationInfo = {}
	public commandMgr: CommandMgr
	public actionMgr: ActionMgr
	public tryShapesMgr: TryShapesMgr
	public tooltipScheduler: Scheduler

	private scoreBoard: ScoreBoard
	private fishCounters: Counter[] = []
	private handCardsCounters: Counter[] = []

	protected settings = [new Setting('customSounds', 'pref', 1)]
	private displayedTooltip

	private clickConnectNb: number = 0
	private clickConnectNbToElemMap = {}
	private clickConnectIdToNbMap = {}

	/*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
	public setup(gamedatas: any) {
		log('Starting game setup')
		this.gameui = gameui as any as GameGui<TheIsleOfCatsDuelGamedatas>
		this.dontPreloadUselessAssets()
		this.customSounds.forEach((sound) => {
			this.gameui.sounds.load(sound, sound)
		})

		this.includeHtmlBasicTemplate()
		log('gamedatas', gamedatas)

		this.animationManager = new BgaAnimations.Manager({
			animationsActive: () => this.gameui.bgaAnimationsActive()
		})
		this.cardsManager = new CardsManager(this)

		if (gamedatas.lastTurn) {
			this.notif_lastTurn(false)
		}
		if (Number(gamedatas.gamestate.id) >= 90) {
			// score or end
			this.onEnteringEndScore()
		}

		const gameArea = document.getElementById('custom-game-area')
		this.island = new Island(this, gamedatas)
		Object.values(this.gamedatas.playerOrderWorkingWithSpectators).forEach((p) => {
			this.setupPlayer(this.gamedatas.players[p])
		})
		this.jumpToManager = new JumpToManager(this, {
			localStorageFoldedKey: 'tioc-duel-jumpto-folded',
			topEntries: [new JumpToEntry(_('Island'), 'island', { 'color': '#8ed225' })]
		})
		this.setupTreasureZones()
		this.boatMgr = new BoatMgr(this)
		this.boatMgr.setup(gamedatas)
		this.commandMgr = new CommandMgr(this)
		this.commandMgr.setup(gamedatas)
		this.islandMgr = new IslandMgr(this)
		this.islandMgr.setup(gamedatas)
		this.shapeControl = new ShapeControl(this)
		this.actionMgr = new ActionMgr(this)
		this.tryShapesMgr = new TryShapesMgr(this)

		this.tooltipScheduler = new Scheduler(() => this.updateTooltipsNow())
		this.setupCatsCounter()

		const discard = document.getElementById('tioc-island-discard')
		/*if (discard.childElementCount != 0) {
			this.actionMgr.addCommand(_rescueCatStartCommand)
			_rescueCatEndCommand
		}*/

		//;(this.gameui as any).updateCounters(this.gamedatas.counters)

		$('overall-content').classList.add(`player-count-${this.getPlayersCount()}`)

		this.setupPreferences()
		this.setupTooltips()
		this.setupHelpPopin()

		/*this.scoreBoard = new ScoreBoard(this, this.getPlayersInOrder())
		this.gamedatas.scores?.forEach((s) => this.scoreBoard.updateScore(s.playerId, s.scoreType, s.score))
		if (this.gamedatas.winners) {
			this.gamedatas.winners.forEach((pId) => this.scoreBoard.highlightWinnerScore(pId))
		}*/
		removeClass('animatedScore')
		this.setupNotifications()
		BgaAutofit.init()

		log('Ending game setup')
	}

	private setupCatsCounter() {
		document.querySelectorAll<HTMLElement>('#tioc-round-counter-cats .tioc-shape').forEach((shape) => {
			shape.addEventListener("click", () => { 
				if(this.gamedatas.gamestate.name=="SelectNextRoundCat" && this.gameui.isCurrentPlayerActive()) {
					this.takeAction('actPutCatBack', { shapeId: shape.dataset.shapeId })
				}
			})
		})
	}

	private setupTreasureZones() {}

	private setupTooltips() {
		//todo change counter names
		this.setTooltipToClass('revealed-tokens-back-counter', _('counter1 tooltip'))
		this.setTooltipToClass('tickets-counter', _('counter2 tooltip'))
		this.setTooltipToClass('hand-cards-counter', _('Cards in hand'))
		this.setTooltipToClass('deck-cards-counter', _('Cards in deck'))

		this.setTooltipToClass('cstm-help-icon', `<div class="help-card recto"></div>`)
		this.setTooltipToClass('cstm-help-icon-mini', `<div class="help-card verso"></div>`)
		this.setTooltipToClass('player-turn-order', _('First player'))
	}

	private setupPlayer(player: TheIsleOfCatsDuelPlayer) {
		document.getElementById(`overall_player_board_${player.id}`).dataset.playerColor = player.color
		this.setupMiniPlayerBoard(player)
		this.playerTables[player.id] = new PlayerTable(this, player, player.hand)
	}

	private setupMiniPlayerBoard(player: TheIsleOfCatsDuelPlayer) {
		const playerId = Number(player.id)
		this.gameui.getPlayerPanelElement(playerId).insertAdjacentHTML(
			'afterbegin',
			`<div id="counters-${player.id}" class="counters">
				<div id="fish-player-counter-${player.id}-wrapper" class="counter fish-counter">
					<div class="icon fish"></div> 
					<span id="fish-player-counter-${player.id}"></span>
				</div>
			
				<div id="hand-cards-counter-${player.id}-wrapper" class="counter hand-cards-counter counter-left-part">
					<div class="fa fa-hand-paper-o"></div> 
					<span id="hand-cards-counter-${player.id}"></span>
				</div>
			</div>
			<div id="additional-info-${player.id}" class="counters additional-info">
				<div id="additional-icons-${player.id}" class="additional-icons"></div> 
			</div>
			`
		)

		/* const revealedTokensBackCounter = new ebg.counter();
            revealedTokensBackCounter.create(`revealed-tokens-back-counter-${player.id}`);
            revealedTokensBackCounter.setValue(player.revealedTokensBackCount);
            this.revealedTokensBackCounters[playerId] = revealedTokensBackCounter;
*/

		const fishCounter = new ebg.counter()
		fishCounter.create(`fish-player-counter-${player.id}`, {
			value: player.fish,
			playerCounter: 'fish',
			playerId: player.id
		})
		this.fishCounters[playerId] = fishCounter

		const cardsCounter = new ebg.counter()
		cardsCounter.create(`hand-cards-counter-${player.id}`)
		cardsCounter.setValue(player.cardsCount)
		this.handCardsCounters[playerId] = cardsCounter

		const jstpl_player_panel = `
			<div class="tioc-player-panel-row">
				<div class="tioc-player-panel-pill-counter big" id="tioc-player-panel-order-${player.id}">0</div>
			</div>

			<div class="tioc-family-hidden tioc-player-panel-row tioc-break">
				<div class="tioc-player-panel-pill">
				<div class="tioc-player-panel-fish"></div>
				<div class="tioc-player-panel-pill-counter" id="tioc-player-panel-fish-counter-${player.id}">0</div>
				</div>

				<div class="tioc-player-panel-pill">
				<div class="tioc-player-panel-private-lesson"></div>
				<div class="tioc-player-panel-pill-counter" id="tioc-player-panel-private-lesson-counter-${player.id}">0</div>
				</div>
			</div>

			<div class="tioc-player-panel-row tioc-compact">
				${['blue', 'green', 'orange', 'purple', 'red', 'common']
					.map(
						(color) => `
				<div class="tioc-player-panel-pill">
					<div class="tioc-player-panel-shape-face-${color}"></div>
					<div class="tioc-player-panel-pill-counter"
						id="tioc-player-panel-shape-face-${color}-${player.id}">0</div>
				</div>`
					)
					.join('')}
			</div>

			<div class="tioc-player-panel-row">
				<div id="tioc-player-panel-boat-container-${player.id}" class="tioc-player-panel-boat-container"></div>
			</div>
			`

		this.gameui.getPlayerPanelElement(playerId).insertAdjacentHTML('beforeend', jstpl_player_panel)
	}

	private setupHelpPopin() {
		new HelpManager(this, {
			buttons: [
				new BgaHelpPopinButton({
					title: _('Roles in play'),
					html: this.getHelpHtml(),
					buttonBackground: 'white',
					buttonColor: '#266059'
				})
			]
		})
	}

	private getHelpHtml() {
		let html = `
        <div id="help-popin"> `
		/*new Set(this.gamedatas.rolesInPlay).forEach((r) => {
			html += this.getRoleHtml(r, this.gamedatas.rolesInPlay.filter((allR) => allR === r).length)
		})*/
		html += `
        </div>
        `
		return html
	}

	/* This enable to inject translatable styled things to logs or action bar */
	/* @Override */
	public bgaFormatText(log: string, args: any): { log: string; args: any } {
		try {
			const keys = ['shape_img', 'shapes_img', 'fish_img']
			for (const i in keys) {
				const key = keys[i]
				args[key] = this.getHtmlForLogArgs(key, args)
			}
		} catch (e) {
			console.error(log, args, 'Exception thrown', e.stack)
		}
		return { log, args }
	}

	public getHtmlForLogArgs(key: string, args: []) {
		if (!(key in args)) {
			return ''
		}
		switch (key) {
			case 'shape_img':
				const shape = args[key]
				return this.formatShapeElementForLog(shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId)
			case 'shapes_img':
				const shapes = args[key]
				let html = ''
				for (const shape of shapes) {
					html += this.formatShapeElementForLog(
						shape.shapeId,
						shape.shapeTypeId,
						shape.shapeDefId,
						shape.colorId
					)
				}
				return html
			case 'fish_img':
				return '<div class="tioc-log-fish"></div>'
		}
		return ''
	}

	///////////////////////////////////////////////////
	//// Game & client states

	// onEnteringState: this method is called each time we are entering into a new game state.
	//                  You can use this method to perform some user interface changes at this moment.
	//
	public onEnteringState(stateName: string, args: any) {
		log('Entering state: ' + stateName, args)
		this.shapeControl.detach()
		this.removeAllClickable()
		switch (stateName) {
			case 'PlayerTurn':
				if (args?.args) {
					const dataArgs = args.args as EnteringPlayerTurnArgs
					this.onEnteringChooseAction(dataArgs)
				}
				break
			case 'endScore':
				this.onEnteringEndScore()
				break
		}
	}

	private onEnteringChooseAction(args: EnteringPlayerTurnArgs) {
		//todo
		document.getElementById('boat-choice')?.remove()
		if (this.gameui.isCurrentPlayerActive()) {
			this.resetClientActionData()
			this.island.enableSlots(args.oshaxValidMoves)
			if (args.remainingMoves > 0) {
				//nothing
			} else if (args.remainingTreasures > 0) {
				this.setChooseActionGamestateDescription(
					_('${you} can select one treasure and place it on your boat or end your turn')
				)
				this.islandMgr.allowTakeTreasure()
			} else if (args.mandatoryMoveDone) {
				if (args.possibleSlotsForDiscovery.length > 0) {
					this.island.enableSlots(args.possibleSlotsForDiscovery)
					this.setChooseActionGamestateDescription(
						_('${you} can select one discovery and/or use fish or end your turn')
					)
				} else {
					this.setChooseActionGamestateDescription(_('${you} can use fish or end your turn'))
				}

				//this.actionMgr.allowRescueCat();
			}

			//const actions = this.getPossibleActions(args)
			//this.setChooseActionGamestateDescription(actions.join(_(' or ')))
		}
		//this.missions.addCards(args._private.missions).then(()=>this.missions.setSelectableCards(args._private.choosableMissions))
	}

	private getPossibleActions(args: EnteringPlayerTurnArgs) {
		const actions = []

		//if (args.canBuild) actions.push(_('Build your mall'))
		//if (args.canTakeMoney) actions.push(_('Take money from the dispenser'))

		if (actions.length === 0) {
			actions.push(_('No possible action left'))
		}
		return actions
	}

	/**
	 * Show score board.
	 */
	private onEnteringEndScore() {
		const lastTurnBar = document.getElementById('last-round')
		if (lastTurnBar) {
			lastTurnBar.style.display = 'none'
		}
	}

	// onLeavingState: this method is called each time we are leaving a game state.
	//                 You can use this method to perform some user interface changes at this moment.
	//
	public onLeavingState(stateName: string) {
		log('Leaving state: ' + stateName)

		switch (stateName) {
			/* Example:
        
        case 'myGameState':
        
            // Hide the HTML block we are displaying only during this game state
            dojo.style( 'my_html_block_id', 'display', 'none' );
            
            break;
        */

			case 'BoatChoice':
				break
		}
	}

	// onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
	//                        action status bar (ie: the HTML links in the status bar).
	//
	public onUpdateActionButtons(stateName: string, args: any) {
		log('onUpdateActionButtons: ' + stateName, args)

		if (this.gameui.isCurrentPlayerActive()) {
			switch (stateName) {
				case 'PlayerTurn':
					this.statusBar.addActionButton(_('Validate'), () => this.selectInSetAction(), {
						id: 'btn-validate'
					})
					this.toggleActionButtonVisibility('btn-validate', false)
					this.setActionBarChooseAction(false)
					break
				case 'BoatChoice':
					if (!document.getElementById('choose-oboat-button')) {
						this.statusBar.addActionButton(
							_('Choose the first boat'),
							() => this.takeAction('actChooseBoat', { boat: 'OBoat' }),
							{ id: 'choose-oboat-button' }
						)
						this.statusBar.addActionButton(
							_('Choose the second boat'),
							() => this.takeAction('actChooseBoat', { boat: 'IBoat' }),
							{ id: 'choose-iboat-button' }
						)
						const oButton = document.getElementById('choose-oboat-button')
						document.querySelector('#boat-choice .OBoat').appendChild(oButton)
						const iButton = document.getElementById('choose-iboat-button')
						document.querySelector('#boat-choice .IBoat').appendChild(iButton)
					}
					break
			}
			this.commandMgr.onUpdateActionButtons(stateName, args)
		} else {
			if (!this.tryShapesMgr.isTryingShapes()) {
				this.removeAllClickable()
			}
		}
		this.tryShapesMgr.onUpdateActionButtons(stateName, args)
	}

	private selectInSetAction() {
		/*
		if (this.playerSet.getSelection().length == 5) {
			this.takeAction('actSelectInSet', {
				cardIds: this.getSelectedIdsAsParam(this.playerSet)
			})
		} else {
			;this.gameui.showMessage(_('You have to select 5 cards'), 'error')
		}
		*/
	}

	///////////////////////////////////////////////////
	//// Utility methods
	///////////////////////////////////////////////////

	private getSelectedIdsAsParam(stock: CardStock<TheIsleOfCatsDuelCard>) {
		return stock
			.getSelection()
			.map((c) => c.cardId)
			.join(',')
	}

	public isRealTime() {
		return this.gameui.bRealtime
	}

	public closeCurrentTooltip() {
		if (this.displayedTooltip == null) return
		else {
			this.displayedTooltip.close()
			this.displayedTooltip = null
		}
	}

	public addTooltipOnClickHelpButton(id, html, delay) {
		/*let tooltip = new dijit.Tooltip({
			label: html,
			showDelay: delay
		})

		dojo.connect($(id), 'click', (evt) => {
			evt.stopPropagation()

			if (tooltip.state == 'SHOWING') {
				this.closeCurrentTooltip()
			} else {
				this.closeCurrentTooltip()
				tooltip.open($(id))
				this.displayedTooltip = tooltip
			}
		})

		dojo.connect($(id), 'mouseleave', () => {
			tooltip.close()
		})*/
	}

	public dontPreloadUselessAssets() {
		if (this.getPlayersCount() == 1) {
			//;this.gameui.dontPreloadImage('centralBoard.png')//TODO
		} else {
			//;this.gameui.dontPreloadImage('centralBoardSolo.png')
		}
	}

	public toggleActionButtonAbility(buttonId: string, enable: boolean, autoClickIfEnabled: boolean = undefined) {
		if (autoClickIfEnabled == undefined) {
			//autoClickIfEnabled= this.isConfirmOnlyOnPlacingTokensOn()
		}
		dojo.toggleClass(buttonId, 'disabled', !enable)
		if (autoClickIfEnabled && !dojo.hasClass(buttonId, 'disabled')) {
			$(buttonId).click()
		}
	}

	/** Tells if confirm is active in user prefs. */
	public isConfirmOnlyOnPlacingTokensOn(): boolean {
		//return this.gameui.prefs[2].value == 1
		return true
	}

	public resetClientActionData() {
		this.clientActionData = {
			placedCardId: undefined,
			destinationSquare: undefined,
			previousCardParentInHand: undefined
		}
	}

	private setChooseActionGamestateDescription(newText?: string) {
		if (!this.originalTextChooseAction) {
			this.originalTextChooseAction = document.getElementById('pagemaintitletext').innerHTML
		}

		this.gameui.statusBar.setTitle(newText ?? this.originalTextChooseAction)
	}

	/**
	 * Sets the action bar (title and buttons) for Choose action.
	 */
	private setActionBarChooseAction(fromCancel: boolean) {
		document.getElementById(`generalactions`).innerHTML = ''
		const chooseActionArgs = this.gamedatas.gamestate.args as EnteringPlayerTurnArgs

		if (fromCancel) {
			this.setChooseActionGamestateDescription()
		}
		if (this.actionTimerId) {
			window.clearInterval(this.actionTimerId)
		}

		if (chooseActionArgs.canTradeFishForMove) {
			this.statusBar.addActionButton(_('Get one more move'), () => {
				this.takeAction('actTradeFishForAction', { additionalAction: 'M' })
			})
		}
		if (chooseActionArgs.canTradeFishForJump) {
			this.statusBar.addActionButton(_('Jump'), () => {
				this.takeAction('actTradeFishForAction', { additionalAction: 'J' })
			})
		}
		if (chooseActionArgs.canTradeFishForTreasure) {
			this.statusBar.addActionButton(_('Take treasure'), () => {
				this.takeAction('actTradeFishForAction', { additionalAction: 'T' })
			})
		}
		if (chooseActionArgs.canTradeFishForDiscovery) {
			this.statusBar.addActionButton(_('Take discovery'), () => {
				this.takeAction('actTradeFishForAction', { additionalAction: 'D' })
			})
		}
		this.addImageActionButton(
			'useTicket_button',
			createDiv('expTicket', 'expTicket-button'),
			'primary',
			_('Use a ticket to place another arrow, remove the last one of any expedition or exchange a card'),
			() => {
				// this.useTicket();
			}
		)
		$('expTicket-button').parentElement.style.padding = '0'
		//{autoclick: true}

		//dojo.toggleClass('useTicket_button', 'disabled', !chooseActionArgs.canUseTicket);
		if (chooseActionArgs.canPass) {
			this.statusBar.addActionButton(_('End my turn'), () => this.pass(), { color: 'alert' })
		}

		if (chooseActionArgs.canResetTurn) {
			this.statusBar.addActionButton(_('Reset my turn'), () => this.takeAction('actResetPlayerTurn'), {
				color: 'alert',
				title: _('Reset your entire round')
			})
		}
	}

	public clickOnSlot(slot: number) {
		log('clickOnSlot', slot)
		if (this.gameui.isCurrentPlayerActive() && this.gamedatas.gamestate.name == 'PlayerTurn')
			if (this.gamedatas.gamestate.args.remainingMoves > 0 && !this.tryShapesMgr.isInCmd) {
				this.takeAction('actMoveOshax', { slot: slot })
			} else if (this.gamedatas.gamestate.args.mandatoryMoveDone) {
				//this.takeAction('actTakeDiscovery', { slot: slot })
				if (this.island.isCardSlot(slot)) {
				} else {
					const shape = document.querySelector<HTMLElement>(`#island-slot-${slot} .tioc-shape`)
					const shapeId = shape.id
					//this.actionMgr.rescueCat(shapeId)
					this.boatMgr.allowPlaceShape((x, y) => {
						log('moveShapeToBoat')
						this.boatMgr.moveShapeToBoat(this.getPlayerId(), shape.dataset.shapeId, x, y)
						const onConfirm = (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
							if (!this.tryShapesMgr.isInCmd) {
								this.takeAction('actMoveShapeToBoat', {
									shapeId: shapeId,
									x: x,
									y: y,
									rotation: rotation,
									flipH: flipH ? 1 : 0,
									flipV: flipV ? 1 : 0
								})
							}
						}
						this.shapeControl.attachToShapeId(shape.dataset.shapeId, x, y, onConfirm)
					})
				}
			}
	}

	public handSelectionChange(selection: TheIsleOfCatsDuelCard[], lastChange: TheIsleOfCatsDuelCard): void {
		if (this.gameui.isCurrentPlayerActive()) {
			this.toggleActionButtonVisibility('btn-validate', selection.length > 0)
		}
	}

	///////////////////////////////////////////////////
	//// Player's action

	/*
    
        Here, you are defining methods to handle player's action (ex: results of mouse click on 
        game objects).
        
        Most of the time, these methods:
        _ check the action is possible at this game state.
        _ make a call to the game server
    
    */
	private ensureStockSelection(stocks: CardStock<TheIsleOfCatsDuelCard>[], errorMsg: string, callback: Function) {
		if (stocks.every((s) => s.getSelection().length > 0)) {
			callback()
		} else {
			this.gameui.showMessage(errorMsg, 'error')
		}
	}

	///////////////////////////////////////////////////
	//// Reaction to cometD notifications

	/*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your theisleofcatsduel.game.php file.
    
    */
	setupNotifications() {
		log('notifications subscriptions setup')

		// TODO: here, associate your game notifications with local methods

		// Example 1: standard notification handling
		// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

		// Example 2: standard notification handling + tell the user interface to wait
		//            during 3 seconds after calling the method in order to let the players
		//            see what is happening in the game.
		// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
		// this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
		//

		const notifs = [
			['points', 1],
			['score', ANIMATION_MS],
			['highlightWinnerScore', ANIMATION_MS],
			['materialMove', ANIMATION_MS],
			['oshaxMove', ANIMATION_MS],
			['lastTurn', 1],
			['importantMessage', 3000],
			['counter', 1],
			['updateCounters', 1],
			['resetIsland', 1],
			['NTF_MOVE_SHAPE_TO_BOAT', 1],
			['NTF_DISCARD_SHAPES', 1],
			['NTF_UPDATE_BOAT_USED_GRID_COLOR', 1]
		]

		notifs.forEach((notif) => {
			dojo.subscribe(notif[0], this, `notif_${notif[0]}`)
			//comment to prevent formating to glue these 2 lines
			;(this.gameui as any).notifqueue.setSynchronous(notif[0], notif[1])
		})
	}

	notif_resetIsland(notif: Notif<NotifResetIslandArgs>) {
		log('notif_resetIsland', notif)
		this.island.resetIsland(notif.args.cards, notif.args.shapes)
	}

	notif_NTF_MOVE_SHAPE_TO_BOAT(notif) {
		log('notif_NTF_MOVE_SHAPE_TO_BOAT', notif)
		this.boatMgr.moveAndTransformShapeToBoat(notif.args.player_id, notif.args.shape)
	}

	notif_NTF_UPDATE_BOAT_USED_GRID_COLOR(notif) {
		log('notif_NTF_UPDATE_BOAT_USED_GRID_COLOR', notif)
		this.boatMgr.updatePlayerPanelBoat(notif.args.boatUsedGridColor)
	}

	  notif_NTF_DISCARD_SHAPES(notif) {
                for (const shape of notif.args.shapes) {
                    this.addKnownShape(shape);
                    this.islandMgr.discardShapeId(shape.shapeId);
                }
            }
	/**
	 * Updates a total or subtotal
	 * @param notif
	 */
	notif_score(notif: Notif<NotifScoreArgs>) {
		log('notif_score', notif)
		this.scoreBoard.updateScore(notif.args.playerId, notif.args.scoreType, notif.args.score)
	}
	notif_oshaxMove(notif: Notif<NotifOshaxMoveArgs>) {
		log('notif_oshaxMove', notif.args)
		this.island.refreshOshaxLocation(notif.args.to)
	}

	notif_counter(notif: Notif<NotifCounter>) {
		if (notif.args.counterName == 'empty-hexes') {
			//this.emptyHexesCounters[notif.args.playerId].setValue(notif.args.counterValue)
		}
	}

	notif_materialMove(notif: Notif<NotifMaterialMove>) {
		log('notif_materialMove', notif)
		/*switch (notif.args.type) {
			case "MISSION":
				const cards = notif.args.material as Array<MissionCard>
				this.notif_missionMove(cards, notif)
				break
			default:
				console.error('Material type move not handled', notif)
				break
		}*/
	}

	/* notif_missionMove(cards: MissionCard[], notif: Notif<NotifMaterialMove>) {
		const card = cards.at(0)
		switch (notif.args.to) {
			case "DISCARD":
				if (notif.args.fromArg == notif.args.toArg) {
					this.festivalStocks[notif.args.toArg].flipCard(card)
					if (notif.args?.soldOut) this.playCustomSound('clap', false)
				} else {
					this.festivalStocks[notif.args.toArg].addCard(card)
				}
				break

			default:
				console.error('Festival move destination not handled', notif)
				break
		}
	}*/

	/**
	 * Highlight winner for end score.
	 */
	notif_highlightWinnerScore(notif: Notif<NotifWinnerArgs>) {
		this.scoreBoard?.highlightWinnerScore(notif.args.playerId)
	}

	public clickConnect(element, fct) {
		if (!this.clickConnectNbToElemMap) {
			this.clickConnectNb = 0
			this.clickConnectNbToElemMap = {}
			this.clickConnectIdToNbMap = {}
		}
		this.clickDisconnect(element)
		if (element.id && element.id.length > 0 && element.id in this.clickConnectIdToNbMap) {
			const nb = this.clickConnectIdToNbMap[element.id]
			if (nb in this.clickConnectNbToElemMap && this.clickConnectNbToElemMap[nb].element == element) {
				if (this.clickConnectNbToElemMap[nb].link !== null) {
					dojo.disconnect(this.clickConnectNbToElemMap[nb].link)
				}
				this.clickConnectNbToElemMap[nb].link = dojo.connect(element, 'onclick', fct)
				return
			}
		}
		const newNb = this.clickConnectNb++
		this.clickConnectNbToElemMap[newNb] = {
			element: element,
			link: dojo.connect(element, 'onclick', fct)
		}
		if (element.id && element.id.length > 0) {
			this.clickConnectIdToNbMap[element.id] = newNb
		}
	}
	public clickDisconnect(element) {
		if (!this.clickConnectNbToElemMap) {
			this.clickConnectNb = 0
			this.clickConnectNbToElemMap = {}
			this.clickConnectIdToNbMap = {}
		}
		if (element.id && element.id.length > 0 && element.id in this.clickConnectIdToNbMap) {
			const nb = this.clickConnectIdToNbMap[element.id]
			if (nb in this.clickConnectNbToElemMap && this.clickConnectNbToElemMap[nb].element == element) {
				if (this.clickConnectNbToElemMap[nb].link !== null) {
					dojo.disconnect(this.clickConnectNbToElemMap[nb].link)
					this.clickConnectNbToElemMap[nb].link = null
				}
				return
			}
		}
		for (const nb in this.clickConnectNbToElemMap) {
			if (this.clickConnectNbToElemMap[nb].element == element) {
				dojo.disconnect(this.clickConnectNbToElemMap[nb].link)
				delete this.clickConnectNbToElemMap[nb]
				return
			}
		}
	}
	public tiocClickCleanup() {
		if (!this.clickConnectNbToElemMap) {
			this.clickConnectNb = 0
			this.clickConnectNbToElemMap = {}
			this.clickConnectIdToNbMap = {}
		}
		for (const nb in this.clickConnectNbToElemMap) {
			if (!document.body.contains(this.clickConnectNbToElemMap[nb].element)) {
				dojo.disconnect(this.clickConnectNbToElemMap[nb].link)
				delete this.clickConnectNbToElemMap[nb]
				break
			}
		}
		for (const id in this.clickConnectIdToNbMap) {
			const nb = this.clickConnectIdToNbMap[id]
			if (!(nb in this.clickConnectNbToElemMap)) {
				delete this.clickConnectIdToNbMap[id]
			}
		}
	}
	public removeAllClickable() {
		const elements = document.querySelectorAll('.tioc-clickable')
		for (const e of Array.from(elements)) {
			this.clickDisconnect(e)
			e.classList.remove('tioc-clickable')
			e.classList.remove('tioc-clickable-no-border')
		}
		dojo.query('.tioc-selected').removeClass('tioc-selected')
		this.tiocClickCleanup()
	}
	public removeClickableId(id: string, removeSelected = true) {
		this.removeClickable(document.getElementById(id), removeSelected)
	}
	public removeClickable(element: HTMLElement, removeSelected = true) {
		if (element === null) {
			return
		}
		this.clickDisconnect(element)
		element.classList.remove('tioc-clickable')
		element.classList.remove('tioc-clickable-no-border')
		if (removeSelected) {
			element.classList.remove('tioc-selected')
		}
	}
	public removeClickableClickOnlyId(id: string) {
		const element = document.getElementById(id)
		if (element === null) {
			return
		}
		this.clickDisconnect(element)
		element.classList.add('tioc-clickable-no-border')
	}

	public allowSelect(element: HTMLElement) {
		element.classList.add('tioc-clickable')
		this.clickConnect(element, (event) => {
			//window.tiocWrap('allowSelect', () => {
			element.classList.toggle('tioc-selected')
			//})
		})
	}
	public addOnClick(element: HTMLElement, onClick) {
		element.classList.add('tioc-clickable')
		this.clickConnect(element, (event) => {
			//window.tiocWrap('addOnClick', () => {
			//debugger
			onClick(event)
			//})
		})
	}
	public removeAbsolutePosition(elementId: string) {
		const elem = document.getElementById(elementId)
		if (elem !== null) {
			dojo.style(elem, {
				left: null,
				right: null,
				top: null,
				bottom: null,
				position: null
			})
			elem.classList.remove('tioc-moving')
			// Try to force reflow...
			if (elem.offsetHeight !== undefined) {
				void elem.offsetHeight
			}
			const parentElem = elem.parentElement
			if (parentElem !== null) {
				if (parentElem.offsetHeight !== undefined) {
					void parentElem.offsetHeight
				}
			}
		}
	}
	public addClass(elementId: string, className: string) {
		const elem = document.getElementById(elementId)
		if (elem != null) {
			elem.classList.add(className)
		}
	}
	public removeClass(elementId: string, className: string) {
		const elem = document.getElementById(elementId)
		if (elem != null) {
			elem.classList.remove(className)
		}
	}
	public tiocFadeOutAndDestroy(element: HTMLElement, duration = 500, onEnd = null) {
		if (duration === undefined || duration === null) {
			duration = 500
		}
		if (this.gameui.bgaAnimationsActive()) {
			duration = 1
		}
		const anim = dojo.fadeOut({
			node: element,
			duration: duration,
			delay: 0
		})
		dojo.connect(anim, 'onEnd', (e) => {
			//window.tiocWrap('tiocFadeOutAndDestroy_onEnd', () => {
			dojo.destroy(e)
			if (onEnd !== null) {
				onEnd(e)
			}
			//})
		})
		anim.play()
	}
	public normalizeRotation(rotation: number) {
		while (rotation >= 360) {
			rotation -= 360
		}
		while (rotation < 0) {
			rotation += 360
		}
		return rotation
	}
	public applyTransformToElement(element: HTMLElement, rotation: number, flipH: boolean, flipV: boolean) {
		const transform = []
		const normalizedRot = this.normalizeRotation(rotation)
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

		element.style.transform = transform.join(' ')
	}

	public addKnownShape(shape) {
		this.shapesCreationInfo[shape.shapeId] = shape
	}

	public getShapeColorIdFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return ''
		}
		return this.shapesCreationInfo[shapeId].colorId
	}
	public getShapeColorFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return ''
		}
		const colorId = this.shapesCreationInfo[shapeId].colorId
		if (colorId === null) {
			return ''
		}
		return CAT_COLOR_NAMES[colorId]
	}
	public getCurrentColorFromShapeId(shapeId) {
		const shapeElemId = 'tioc-shape-id-' + shapeId
		const meepleElem = document.querySelector('#' + shapeElemId + ' .tioc-meeple')
		if (meepleElem === null) {
			return this.getShapeColorFromShapeId(shapeId)
		}
		for (let colorId = 0; colorId < CAT_COLOR_NAMES.length; ++colorId) {
			if (meepleElem.classList.contains(CAT_COLOR_NAMES[colorId])) {
				return CAT_COLOR_NAMES[colorId]
			}
		}
		return this.getShapeColorFromShapeId(shapeId)
	}
	public getShapeDefIdFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return 100
		}
		return this.shapesCreationInfo[shapeId].shapeDefId
	}

	public getShapeWidthFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return 0
		}
		return this.shapesCreationInfo[shapeId].width
	}
	public getShapeHeightFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return 0
		}
		return this.shapesCreationInfo[shapeId].height
	}
	public getShapeCoverageFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		const shapeArray = this.getShapeArrayFromShapeId(shapeId)
		const h = shapeArray.length
		const w = shapeArray[0].length
		let nb = 0
		for (let i = 0; i < w; ++i) {
			for (let j = 0; j < h; ++j) {
				if (shapeArray[j][i] != 0) {
					++nb
				}
			}
		}
		return nb
	}

	public formatShapeElementForLog(shapeId, shapeTypeId, shapeDefId, colorId = null) {
		const color_name = colorId == null ? '' : CAT_COLOR_NAMES[colorId]
		const jstpl_shape_for_log = `<div class="tioc-shape shape-type-${shapeTypeId} ${color_name} shape-def-${shapeDefId}" data-shape-id="${shapeId}"></div>`
		return jstpl_shape_for_log
	}
	public formatShapeElement(shapeId, shapeTypeId, shapeDefId, colorId = null) {
		const color_name = colorId == null ? '' : CAT_COLOR_NAMES[colorId]
		var jstpl_shape = `<div class="tioc-shape shape-type-${shapeTypeId} ${color_name} shape-def-${shapeDefId}" id="tioc-shape-id-${shapeId}" data-shape-id="${shapeId}"></div>`
		return jstpl_shape
	}
	public createShapeElement(location, shapeId, shapeTypeId, shapeDefId, colorId = null): HTMLElement {
		dojo.place(this.formatShapeElement(shapeId, shapeTypeId, shapeDefId, colorId), location)
		this.updateTooltips()
		return document.getElementById(`tioc-shape-id-${shapeId}`)
	}
	public forEachShapeGrid(shapeId, x, y, rotation, paramFlipH, paramFlipV, gridFunction) {
		let shapeArray = this.getShapeArrayFromShapeId(shapeId)
		const normalizedRot = this.normalizeRotation(rotation)
		for (let r = 0; r < normalizedRot; r += 90) {
			shapeArray = this._rotateArray90(shapeArray)
		}
		const invertFlip = normalizedRot == 90 || normalizedRot == 270
		const flipH = invertFlip ? paramFlipV : paramFlipH
		const flipV = invertFlip ? paramFlipH : paramFlipV
		if (flipH) {
			shapeArray = this._flipArrayH(shapeArray)
		}
		if (flipV) {
			shapeArray = this._flipArrayV(shapeArray)
		}
		const h = shapeArray.length
		const w = shapeArray[0].length
		for (let i = 0; i < w; ++i) {
			for (let j = 0; j < h; ++j) {
				if (shapeArray[j][i] != 0) {
					if (gridFunction(x + i, y + j) === false) {
						return
					}
				}
			}
		}
	}

	public _flipArrayH(shapeArray) {
		return shapeArray.map((a) => a.reverse())
	}
	public _flipArrayV(shapeArray) {
		const newArray = JSON.parse(JSON.stringify(shapeArray))
		return newArray.reverse()
	}
	public _rotateArray90(shapeArray) {
		return shapeArray[0].map((val, index) => shapeArray.map((row) => row[index]).reverse())
	}

	public shapeIdNoTryShapes(shapeId) {
		if (('' + shapeId).endsWith('-try-shapes')) {
			return shapeId.substring(0, shapeId.indexOf('-try-shapes'))
		}
		return shapeId
	}
	public getShapeSizeFromShapeId(shapeId: string) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return {
				width: 0,
				height: 0
			}
		}
		return {
			width: this.shapesCreationInfo[shapeId].width,
			height: this.shapesCreationInfo[shapeId].height
		}
	}
	public getShapeTypeIdFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return SHAPE_TYPE_ID_CAT
		}
		return this.shapesCreationInfo[shapeId].shapeTypeId
	}
	public getShapeTypeNameFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		switch (this.getShapeTypeIdFromShapeId(shapeId)) {
			case SHAPE_TYPE_ID_CAT:
				return _('Cat')
			case SHAPE_TYPE_ID_COMMON_TREASURE:
				return _('Treasure')
		}
		return ''
	}
	public getShapeArrayFromShapeId(shapeId) {
		shapeId = this.shapeIdNoTryShapes(shapeId)
		if (!(shapeId in this.shapesCreationInfo)) {
			return [[1]]
		}
		return JSON.parse(JSON.stringify(this.shapesCreationInfo[shapeId].shapeArray))
	}

	public closeAllTooltips() {
		/*for (const tooltipId in this.tooltips) {
			if (this.tooltips[tooltipId] !== undefined && this.tooltips[tooltipId] !== null) {
				this.tooltips[tooltipId].close()
			}
		}*/
	}
	public updateTooltips() {
		//this.tooltipScheduler.schedule()
	}
	public updateTooltipsNow() {
		const shapes = document.querySelectorAll('.tioc-shape')

		for (const shape of Array.from(shapes)) {
			if (shape.closest('.tioc-player-boat') !== null) {
				this.gameui.removeTooltip(shape.id)
				continue
			}
			this.updateShapeElementTooltip(shape)
		}
		const cards = document.querySelectorAll('.tioc-card')
		for (const card of Array.from(cards)) {
			this.updateCardElementTooltip(card)
		}
		const buttons = document.querySelectorAll<HTMLElement>('.tioc-player-boat-hide-shapes')
		for (const button of Array.from(buttons)) {
			if (this.boatMgr.isPlayerBoatEmpty(button.dataset.playerId)) {
				button.classList.add('inactive')
			} else {
				button.classList.remove('inactive')
			}
		}
	}

	public getColorNameFromColorId(colorId) {
		switch (colorId) {
			case CAT_COLOR_ID_BLUE:
				return _('Blue')
			case CAT_COLOR_ID_GREEN:
				return _('Green')
			case CAT_COLOR_ID_RED:
				return _('Red')
			case CAT_COLOR_ID_PURPLE:
				return _('Purple')
			case CAT_COLOR_ID_ORANGE:
				return _('Orange')
		}
		return ''
	}
	public getColorNameFromColorCode(colorCode) {
		switch (colorCode) {
			case 'blue':
				return _('Blue')
			case 'green':
				return _('Green')
			case 'red':
				return _('Red')
			case 'purple':
				return _('Purple')
			case 'orange':
				return _('Orange')
		}
		return ''
	}
	public updateShapeElementTooltip(shape, elementId = null) {
		if (shape.dataset.shapeId === undefined || shape.dataset.shapeId === null) {
			return
		}
		if (elementId === null) {
			elementId = shape.id
		}
		this.gameui.removeTooltip(elementId)
		const shapeClone = shape.cloneNode()
		shapeClone.id = ''
		shapeClone.style = ''
		shapeClone.classList.remove('tioc-moving')
		shapeClone.classList.remove('tioc-clickable')
		shapeClone.classList.remove('tioc-selected')
		shapeClone.classList.add('tioc-tooltip-wiggle')
		let title = this.getShapeTypeNameFromShapeId(shape.dataset.shapeId)
		let color = this.getCurrentColorFromShapeId(shape.dataset.shapeId)
		color = this.getColorNameFromColorCode(color)
		if (color.length > 0) {
			color = dojo.string.substitute(_('Color: ${color}'), { color: color })
		}
		const w = this.getShapeWidthFromShapeId(shape.dataset.shapeId)
		const h = this.getShapeHeightFromShapeId(shape.dataset.shapeId)
		const nb = this.getShapeCoverageFromShapeId(shape.dataset.shapeId)

		const description = dojo.string.substitute(
			_('This shape has a width of ${w} square(s) and a height of ${h} square(s). It covers ${nb} square(s).'),
			{
				w: w,
				h: h,
				nb: nb
			}
		)
		const jstpl_tooltip_shape = `${shapeClone.outerHTML}'  <h3>${title}</h3> <p>${description}</p><p>${color}</p>`
		this.gameui.addTooltipHtml(elementId, jstpl_tooltip_shape, 1500)
	}
	public updateCardElementTooltip(card) {
		this.gameui.removeTooltip(card.id)
		const cardClone = card.cloneNode()
		cardClone.id = ''
		cardClone.style = ''
		cardClone.classList.remove('tioc-moving')
		cardClone.classList.remove('tioc-clickable')
		cardClone.classList.remove('tioc-selected')
		cardClone.classList.remove('tioc-card-buy')
		cardClone.classList.add('tioc-card-tooltip-id-' + card.dataset.cardId)
		cardClone.classList.add('tioc-tooltip-wiggle')
		const cardTypeName = this.cardsManager.getCardTypeNameFromCardId(card.dataset.cardId)
		//let color = this.cardsManager.getCurrentColorIdFromCardId(card.dataset.cardId)
		let color = 'blue' //this.getColorNameFromColorId(color)
		const descNote = this.cardsManager.getDescriptionAndNoteFromCardId(card.dataset.cardId)

		const jstpl_tooltip_card = `
			${cardClone.outerHTML}
			<h3>${cardTypeName} <small>(${card.dataset.cardId})</small></h3>
			<p>${descNote.description}</p>
			<p><i>${descNote.note}</i></p>
			<p>${color}</p>
		`
		this.gameui.addTooltipHtml(card.id, jstpl_tooltip_card, 1000)
	}
	public showInformationDialog(title, paragraphArray, params = {}) {
		this.closeAllTooltips()
		const dialog = new ebg.popindialog()
		dialog.create('tioc-information-dialog')
		dialog.setTitle(title)
		let html = '<div>'
		if ('before' in params) {
			html += params['before']
		}
		let nextIsHeader = false
		for (const p of paragraphArray) {
			if (nextIsHeader) {
				nextIsHeader = false
				html += '<h3>' + dojo.string.substitute(p, params) + '</h3>'
			} else if (p.length == 0) {
				nextIsHeader = true
			} else {
				html += '<p>' + dojo.string.substitute(p, params) + '</p>'
			}
		}
		if ('after' in params) {
			html += params['after']
		}
		html += '</div>'
		dialog.setContent(html)
		dialog.show()
	}

	public changeParent(mobile: string | HTMLElement, new_parent: string | HTMLElement, relation: string = 'last') {
		if (mobile === null) {
			console.error('attachToNewParent: mobile obj is null')
			return
		}
		if (new_parent === null) {
			console.error('attachToNewParent: new_parent is null')
			return
		}
		if (typeof mobile == 'string') {
			mobile = $(mobile)
		}
		if (typeof new_parent == 'string') {
			new_parent = $(new_parent)
		}
		if (typeof relation == 'undefined') {
			relation = 'last'
		}
		// const boundingClientRectZoomScale = this.getBoundingClientRectZoomScale(new_parent);
		//let zoom = this.interface_autoscale === true ? (this.gameinterface_zoomFactor || 1) : 1;
		//if (zoom < 1 && boundingClientRectZoomScale == 1) {
		// in case the browser doesn't handle correctly the zoom scale on dojo.position, we consider the zoom is not set
		let zoom = 1
		//}
		/* if (zoom <= 0) {
                    zoom = 1;
                }
*/
		var src = dojo.position(mobile)
		dojo.style(mobile, 'position', 'absolute')
		dojo.place(mobile, new_parent, relation)
		var tgt = dojo.position(mobile)
		var box = dojo.marginBox(mobile)
		var cbox = dojo.contentBox(mobile)
		var left = box.l + src.x - tgt.x
		var top = box.t + src.y - tgt.y
		this.positionObjectDirectly(mobile, left / zoom, top / zoom)
		box.l += box.w - cbox.w
		box.t += box.h - cbox.h
		return box
	}

	/*getBoundingClientRectZoomScale(obj) {
                const zoom = Math.round((this.interface_autoscale === true ? (this.gameinterface_zoomFactor || 1) : 1) * 1000) / 1000;

                const object = obj ? $(obj) : document.getElementById('page-content');
                const position = dojo.position(object);
                if (position.w > 0) {
                    const zoomScale = Math.round(position.w / object.offsetWidth * 1000) / 1000;
                    return zoomScale > zoom ? 1 : zoomScale;
                } else if (position.h > 0) {
                    const zoomScale = Math.round(position.h / object.offsetHeight * 1000) / 1000;
                    return zoomScale > zoom ? 1 : zoomScale;
                } else {
                    return 1;
                }
            }*/
}
