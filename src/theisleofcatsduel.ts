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
const SHAPE_COLOR_COUNTERS_IDS = [
	CAT_COLOR_ID_BLUE,
	CAT_COLOR_ID_GREEN,
	CAT_COLOR_ID_ORANGE,
	CAT_COLOR_ID_PURPLE,
	CAT_COLOR_ID_RED,
	'treasure'
]

const TILE_SIZE: number = 40
const SMALL_TILE_SIZE: number = 7

class TheIsleOfCatsDuel extends BaseGame implements TheIsleOfCatsDuelGame {
	public TILE_SIZE: 40
	public SMALL_TILE_SIZE: 7

	public cardsManager: CardsManager
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

	private fishCounters: Counter[] = []
	private handCardsCounters: Counter[] = []
	private visibleRatsCounters: Counter[] = []
	private scoreTable = {}

	protected settings = [new Setting('customSounds', 'pref', 1)]
	private displayedTooltip

	private clickConnectNb: number = 0
	private clickConnectNbToElemMap = {}
	private clickConnectIdToNbMap = {}
	public forbidTryShapes: boolean = false

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

		if (Number(gamedatas.gamestate.id) >= 90) {
			// score or end
			this.onEnteringEndScore(gamedatas)
		}

		const gameArea = document.getElementById('custom-game-area')
		this.island = new Island(this, gamedatas)
		Object.values(this.gamedatas.playerOrderWorkingWithSpectators).forEach((p) => {
			this.setupPlayer(this.gamedatas.players[p])
		})

		this.setupTreasureZones()
		this.boatMgr = new BoatMgr(this)
		this.boatMgr.setup(gamedatas)

		Object.values(this.gamedatas.playerOrderWorkingWithSpectators).forEach((p) => {
			const player = this.gamedatas.players[p]
			if (player.boatShape) {
				this.playerTables[player.id].initBoat(player.boatShape, this.gamedatas)
			}
		})

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

		this.setupTooltips()

		removeClass('animatedScore')
		this.setupNotifications()
		BgaAutofit.init()

		log('Ending game setup')
	}

	private setupCatsCounter() {
		document.querySelectorAll<HTMLElement>('#tioc-round-counter-cats .tioc-shape').forEach((shape) => {
			shape.addEventListener('click', () => {
				if (this.gamedatas.gamestate.name == 'SelectNextRoundCat' && this.gameui.isCurrentPlayerActive()) {
					this.takeAction('actPutCatBack', { shapeId: shape.dataset.shapeId })
				}
			})
		})
	}

	private setupTreasureZones() {}

	private setupTooltips() {
		this.setTooltipToClass('tioc-player-panel-shape-face-blue', _("Number of blue cats on this player's boat"))
		this.setTooltipToClass('tioc-player-panel-shape-face-green', _("Number of green cats on this player's boat"))
		this.setTooltipToClass('tioc-player-panel-shape-face-orange', _("Number of orange cats on this player's boat"))
		this.setTooltipToClass('tioc-player-panel-shape-face-purple', _("Number of purple cats on this player's boat"))
		this.setTooltipToClass('tioc-player-panel-shape-face-red', _("Number of red cats on this player's boat"))
		this.setTooltipToClass('tioc-player-panel-rats', _("Number of visible rats on this player's boat"))
		this.setTooltipToClass(
			'tioc-player-panel-shape-face-common',
			_("Number of Common Treasure on this player's boat")
		)
		this.setTooltipToClass(
			'tioc-player-panel-boat-container',
			_(
				"Overview of this player's boat, with cats represented with colored squares and treasures with gray squares."
			)
		)
		this.setTooltipToClass(
			'tioc-color-ref-cat',
			_(
				'If you find it difficult to tell the colour of a cat, you can use their unique body shapes, especially their tail, to help identify the family.'
			)
		)
		this.setTooltipToClass('tioc-player-panel-shape-face-common', _("Number of Treasures on this player's boat"))
		this.setTooltipToClass('oshax', _('Move the Oshax to an adjacent place following the footprints'))
		this.setTooltipToClass(
			'tioc-player-panel-fish',
			_('Number of fishes for this player. Fishes can be used to get additional actions.')
		)
		this.setTooltipToClass('tioc-player-panel-private-lesson', _('Number of Lesson Cards for this player.'))
	}

	private setupPlayer(player: TheIsleOfCatsDuelPlayer) {
		document.getElementById(`overall_player_board_${player.id}`).dataset.playerColor = player.color
		this.setupMiniPlayerBoard(player)
		this.playerTables[player.id] = new PlayerTable(this, player, player.hand)
	}

	private setupMiniPlayerBoard(player: TheIsleOfCatsDuelPlayer) {
		const playerId = Number(player.id)
		const jstpl_player_panel = `
			
			<div class="tioc-family-hidden tioc-player-panel-row tioc-break">
				<div class="tioc-player-panel-pill">
				<div class="tioc-player-panel-fish" id="tioc-player-panel-fish-logo-${player.id}"></div>
				<div class="tioc-player-panel-pill-counter" id="tioc-player-panel-fish-counter-${player.id}">0</div>
				</div>

				<div class="tioc-player-panel-pill">
				<div class="tioc-player-panel-private-lesson" id="tioc-player-panel-lesson-logo-${player.id}"></div>
				<div class="tioc-player-panel-pill-counter" id="tioc-player-panel-private-lesson-counter-${player.id}">0</div>
				</div>
			</div>

			<div class="tioc-player-panel-row tioc-compact">
				${['blue', 'green', 'orange', 'purple', 'red', 'common']
					.map(
						(color) => `
				<div class="tioc-player-panel-pill">
					<div class="tioc-player-panel-shape-face-${color}" id="tioc-player-panel-shape-${color}-logo-${player.id}"></div>
					<div class="tioc-player-panel-pill-counter"
						id="tioc-player-panel-shape-face-${color}-${player.id}">0</div>
				</div>`
					)
					.join('')}
				<div class="tioc-player-panel-pill">
				<div class="tioc-player-panel-rats" id="tioc-player-panel-rats-logo-${player.id}"></div>
				<div class="tioc-player-panel-pill-counter"
					id="tioc-player-panel-rats-counter-${player.id}">0</div>
				</div>
			</div>

			<div class="tioc-player-panel-row">
				<div id="tioc-player-panel-boat-container-${player.id}" class="tioc-player-panel-boat-container"></div>
			</div>
			`

		this.gameui.getPlayerPanelElement(playerId).insertAdjacentHTML('beforeend', jstpl_player_panel)

		//spy on other player
		const spy = `
            <div class="show-player-tableau"><a href="#anchor-player-${player.id}" classes="inherit-color">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.333343 145.79321">
                    <path fill="currentColor" d="M 1.6,144.19321 C 0.72,143.31321 0,141.90343 0,141.06039 0,140.21734 5.019,125.35234 11.15333,108.02704 L 22.30665,76.526514 14.626511,68.826524 C 8.70498,62.889705 6.45637,59.468243 4.80652,53.884537 0.057,37.810464 3.28288,23.775161 14.266011,12.727735 23.2699,3.6711383 31.24961,0.09115725 42.633001,0.00129225 c 15.633879,-0.123414 29.7242,8.60107205 36.66277,22.70098475 8.00349,16.263927 4.02641,36.419057 -9.54327,48.363567 l -6.09937,5.36888 10.8401,30.526466 c 5.96206,16.78955 10.84011,32.03102 10.84011,33.86992 0,1.8389 -0.94908,3.70766 -2.10905,4.15278 -1.15998,0.44513 -19.63998,0.80932 -41.06667,0.80932 -28.52259,0 -39.386191,-0.42858 -40.557621,-1.6 z M 58.000011,54.483815 c 3.66666,-1.775301 9.06666,-5.706124 11.99999,-8.735161 l 5.33334,-5.507342 -6.66667,-6.09345 C 59.791321,26.035633 53.218971,23.191944 43.2618,23.15582 33.50202,23.12041 24.44122,27.164681 16.83985,34.94919 c -4.926849,5.045548 -5.023849,5.323672 -2.956989,8.478106 3.741259,5.709878 15.032709,12.667218 24.11715,14.860013 4.67992,1.129637 13.130429,-0.477436 20,-3.803494 z m -22.33337,-2.130758 c -2.8907,-1.683676 -6.3333,-8.148479 -6.3333,-11.893186 0,-11.58942 14.57544,-17.629692 22.76923,-9.435897 8.41012,8.410121 2.7035,22.821681 -9,22.728685 -2.80641,-0.0223 -6.15258,-0.652121 -7.43593,-1.399602 z m 14.6667,-6.075289 c 3.72801,-4.100734 3.78941,-7.121364 0.23656,-11.638085 -2.025061,-2.574448 -3.9845,-3.513145 -7.33333,-3.513145 -10.93129,0 -13.70837,13.126529 -3.90323,18.44946 3.50764,1.904196 7.30574,0.765377 11,-3.29823 z m -11.36999,0.106494 c -3.74071,-2.620092 -4.07008,-7.297494 -0.44716,-6.350078 3.2022,0.837394 4.87543,-1.760912 2.76868,-4.29939 -1.34051,-1.615208 -1.02878,-1.94159 1.85447,-1.94159 4.67573,0 8.31873,5.36324 6.2582,9.213366 -1.21644,2.27295 -5.30653,5.453301 -7.0132,5.453301 -0.25171,0 -1.79115,-0.934022 -3.42099,-2.075605 z"></path>
                </svg>
                </a>
            </div>
            `
		this.gameui
			.getPlayerPanelElement(playerId)
			.querySelector('.tioc-family-hidden')
			.insertAdjacentHTML('beforeend', spy)

		const fishCounter = new ebg.counter()
		fishCounter.create(`tioc-player-panel-fish-counter-${player.id}`, {
			value: player.fish,
			playerCounter: 'fish',
			playerId: parseInt(player.id)
		})
		this.fishCounters[playerId] = fishCounter

		const cardsCounter = new ebg.counter()
		cardsCounter.create(`tioc-player-panel-private-lesson-counter-${player.id}`, {
			value: player.lesson,
			playerCounter: 'lesson',
			playerId: parseInt(player.id)
		})
		this.handCardsCounters[playerId] = cardsCounter

		const visibleRatsCounters = new ebg.counter()
		visibleRatsCounters.create(`tioc-player-panel-rats-counter-${player.id}`, {
			value: player.rats,
			playerCounter: 'rats',
			playerId: parseInt(player.id)
		})
		this.visibleRatsCounters[playerId] = visibleRatsCounters
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
		}
	}

	private onEnteringChooseAction(args: EnteringPlayerTurnArgs) {
		//todo
		document.getElementById('boat-choice')?.remove()
		if (this.gameui.isCurrentPlayerActive()) {
			this.resetClientActionData()
			this.island.enableSlots(args.oshaxValidMoves)
			document.getElementById('oshax').classList.toggle('mobile', args.remainingMoves > 0)
			if (args.remainingMoves > 0) {
				//nothing
			} else if (args.remainingTreasures > 0) {
				this.setChooseActionGamestateDescription(
					_('${you} can select one treasure and place it on your boat or end your turn')
				)
				this.islandMgr.allowTakeTreasure()
			} else if (args.shapeToPlace) {
				this.setChooseActionGamestateDescription(
					_('${you} must select the drawn shape and place it on your boat')
				)
				this.islandMgr.allowTakeToPlaceShape()
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
		} else {
			if (args.remainingTreasures > 0) {
				this.setChooseActionGamestateDescription(
					_('${actplayer} can select one treasure and place it on his boat')
				)
			} else if (args.shapeToPlace) {
				this.setChooseActionGamestateDescription(
					_('${actplayer} must select place the drawn shape on his boat')
				)
			} else if (args.mandatoryMoveDone) {
				if (args.possibleSlotsForDiscovery.length > 0) {
					this.setChooseActionGamestateDescription(_('${actplayer} can select one discovery and/or use fish'))
				} else {
					this.setChooseActionGamestateDescription(_('${actplayer} can use fish or end his turn'))
				}
			}
		}
		if (args.mandatoryMoveDone) {
			this.island.showCrossedSlots(args.crossedSlots)
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
	private onEnteringEndScore(gamedatas: TheIsleOfCatsDuelGamedatas) {
		for (const player of Object.values(gamedatas.players)) {
			this.updatePlayerScore(player.id, player.score, 'score_rats', player.scoreRats, false)
			this.updatePlayerScore(player.id, player.score, 'score_unfilled_rooms', player.scoreUnfilledRooms, false)
			this.updatePlayerScore(player.id, player.score, 'score_cat_familly', player.scoreCatFamily, false)
			this.updatePlayerScore(player.id, player.score, 'score_lessons', player.scoreLessons, false)
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

		if (chooseActionArgs.shapeToPlace) {
			//nothing else possible, the player have to place the shape
		} else {
			const buttonMove = document.getElementById('button-move')
			buttonMove.classList.toggle(
				'possible-fish-action',
				this.gameui.isCurrentPlayerActive() &&
					chooseActionArgs.mandatoryMoveDone &&
					chooseActionArgs.canTradeFishForMove
			)
			const buttonJump = document.getElementById('button-jump')
			buttonJump.classList.toggle(
				'possible-fish-action',
				this.gameui.isCurrentPlayerActive() &&
					chooseActionArgs.mandatoryMoveDone &&
					chooseActionArgs.canTradeFishForJump
			)
			const buttonTreasure = document.getElementById('button-treasure')
			buttonTreasure.classList.toggle(
				'possible-fish-action',
				this.gameui.isCurrentPlayerActive() &&
					chooseActionArgs.mandatoryMoveDone &&
					chooseActionArgs.canTradeFishForTreasure
			)
			const buttonDiscovery = document.getElementById('button-discovery')
			buttonDiscovery.classList.toggle(
				'possible-fish-action',
				this.gameui.isCurrentPlayerActive() &&
					chooseActionArgs.mandatoryMoveDone &&
					chooseActionArgs.canTradeFishForDiscovery
			)

			if (chooseActionArgs.mandatoryMoveDone) {
				/*
				if (chooseActionArgs.canTradeFishForMove) {
					this.statusBar.addActionButton(
						_('+1 move'),
						() => {
							this.takeAction('actTradeFishForAction', { additionalAction: 'M' })
						},
						{ classes: 'button-trade-fish', id: 'button-move', color: 'secondary' }
					)
					document.getElementById('button-move').insertAdjacentElement('afterbegin', this.createFishSpan())
				}
				if (chooseActionArgs.canTradeFishForJump) {
					this.statusBar.addActionButton(
						_('Jump'),
						() => {
							this.takeAction('actTradeFishForAction', { additionalAction: 'J' })
						},
						{ classes: 'button-trade-fish', id: 'button-jump', color: 'secondary' }
					)
					const buttonJump = document.getElementById('button-jump')
					for (let i = 0; i < 2; i++) {
						buttonJump.insertAdjacentElement('afterbegin', this.createFishSpan())
					}
				}
				if (chooseActionArgs.canTradeFishForTreasure) {
					this.statusBar.addActionButton(
						_('Take treasure'),
						() => {
							this.takeAction('actTradeFishForAction', { additionalAction: 'T' })
						},
						{ classes: 'button-trade-fish', id: 'button-treasure', color: 'secondary' }
					)
					const buttonTreasure = document.getElementById('button-treasure')
					for (let i = 0; i < 2; i++) {
						buttonTreasure.insertAdjacentElement('afterbegin', this.createFishSpan())
					}
				}
				if (chooseActionArgs.canTradeFishForDiscovery) {
					//if (chooseActionArgs.possibleSlotsForDiscovery.some((s) => this.island.hasSlotSomethingToTake(s))){
					this.statusBar.addActionButton(
						_('Take discovery'),
						() => {
							this.takeAction('actTradeFishForAction', { additionalAction: 'D' })
						},
						{ classes: 'button-trade-fish', id: 'button-discovery', color: 'secondary' }
					)
					const buttonDiscovery = document.getElementById('button-discovery')
					for (let i = 0; i < 3; i++) {
						buttonDiscovery.insertAdjacentElement('afterbegin', this.createFishSpan())
					}
					//}
				}*/
			}
			if (
				!chooseActionArgs.discoveryTaken &&
				chooseActionArgs.remainingMoves != 2 &&
				!chooseActionArgs.usedFishAction
			) {
				this.statusBar.addActionButton(
					_('Cancel Oshax moves'),
					() => {
						this.takeAction('actCancelOshaxMoves')
					},
					{ color: 'secondary' }
				)
			}

			if (chooseActionArgs.remainingTreasures > 0) {
				this.statusBar.addActionButton(
					_('Dismiss 1 treasure'),
					() => {
						this.takeAction('actDismissTreasure', {})
					},
					{ color: 'alert' }
				)
			}

			if (chooseActionArgs.canPass) {
				this.statusBar.addActionButton(
					_('End my turn'),
					() => {
						if (this.tryShapesMgr.isTryingShapes()) {
							this.gameui.showMessage(_('Exit try shapes mode before finishing your turn'), 'error')
							return
						}
						if (chooseActionArgs.remainingTreasures > 0) {
							this.gameui.confirmationDialog(
								_('You could place a free treasure. Do you really want to waste it?'),
								() => {
									this.pass()
								}
							)
						} else if (chooseActionArgs.shapeToPlace) {
							this.gameui.confirmationDialog(
								_('You have a shape to place. Do you really want to waste it?'),
								() => {
									this.pass()
								}
							)
						} else if (chooseActionArgs.possibleSlotsForDiscovery.length > 0) {
							this.gameui.confirmationDialog(
								_('Are you sure you wish to pass without taking a discovery?'),
								() => {
									this.pass()
								}
							)
						} else {
							this.pass()
						}
					},
					{ color: 'alert' }
				)
			}

			/*if (chooseActionArgs.canResetTurn) {
				this.statusBar.addActionButton(
					_('Reset my turn'),
					() => this.takeAction('actResetPlayerTurn', null, { lock: true, checkAction: false }),
					{
						color: 'alert',
						title: _('Reset your entire round')
					}
				)
			}*/
		}
	}

	private createFishSpan() {
		const span = document.createElement('span')
		span.classList.add('tioc-player-panel-fish')
		return span
	}

	public toggleActiveElementOnPlayerBoat(playerId: number, active: boolean) {
		document.getElementById(`tioc-player-boat-${playerId}`).classList.toggle('tioc-active-element', active)
	}

	public clickOnSlot(slot: number) {
		log('clickOnSlot', slot)
		if (this.tryShapesMgr.isTryingShapes()) return
		if (this.gameui.isCurrentPlayerActive() && this.gamedatas.gamestate.name == 'PlayerTurn')
			if (this.gamedatas.gamestate.args.remainingMoves > 0 && !this.tryShapesMgr.isInCmd) {
				this.takeAction('actMoveOshax', { slot: slot })
			} else if (this.gamedatas.gamestate.args.mandatoryMoveDone) {
				if (this.island.isCardSlot(slot)) {
					this.takeAction('actTakeDiscovery', { slot: slot })
				} else {
					const shape = document.querySelector<HTMLElement>(`#island-slot-${slot} .tioc-shape`)
					const shapeId = shape.id
					//this.actionMgr.rescueCat(shapeId)
					this.forbidTryShapes = true
					this.tryShapesMgr.updateButton()
					this.statusBar.setTitle(_("Place this shape on your boat"))
					this.toggleActiveElementOnPlayerBoat(this.getPlayerId(), true)
					removeClass('tioc-shape-selected', $("island"))
					$(`island-slot-${slot}`).querySelector<HTMLElement>(".tioc-shape")?.classList.add('tioc-shape-selected')
					this.boatMgr.allowPlaceShape((x, y) => {
						log('moveShapeToBoat')
						shape.dataset.previousParent = shape.parentElement.id
						this.boatMgr.moveShapeToBoat(this.getPlayerId(), shape.dataset.shapeId, x, y)
						const onConfirm = (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
							if (!this.tryShapesMgr.isInCmd) {
								this.forbidTryShapes = false
								this.tryShapesMgr.updateButton()
								this.toggleActiveElementOnPlayerBoat(this.getPlayerId(), false)
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
			['materialMove', ANIMATION_MS],
			['oshaxMove', ANIMATION_MS],
			['importantMessage', 3000],
			['resetIsland', 1],
			['boatChosen', 1],
			['NTF_MOVE_SHAPE_TO_BOAT', 1],
			['NTF_DISCARD_SHAPES', 1],
			['NTF_UPDATE_FILL_FIELDS', 1],
			['NTF_UPDATE_BOAT_USED_GRID_COLOR', 1],
			['NTF_SCORE_BOAT_POSITION', ANIMATION_MS * 3],
			['NTF_SCORE_CARDS', ANIMATION_MS * 3]
		]

		notifs.forEach((notif) => {
			dojo.subscribe(notif[0], this, `notif_${notif[0]}`)
			//comment to prevent formating to glue these 2 lines
			;(this.gameui as any).notifqueue.setSynchronous(notif[0], notif[1])
		})
	}

	notif_NTF_SCORE_CARDS(notif) {
		this.updatePlayerScore(notif.args.player_id, notif.args.totalScore, notif.args.scoreColumn, notif.args.score)
		this.cardsManager.showScoreCards(notif.args.player_id, notif.args.scoreCards)
	}

	notif_NTF_UPDATE_FILL_FIELDS(notif) {
		for (const shape of notif.args.shapes) {
			this.islandMgr.createAndPlaceShape(shape)
		}
	}

	notif_boatChosen(notif: Notif<NotifBoatChosenArgs>) {
		log('notif_boatChosen', notif)
		this.gamedatas.players[notif.args.playerId].boatShape = notif.args.boatShape
		this.playerTables[notif.args.playerId].initBoat(notif.args.boatShape, this.gamedatas)
		if (notif.args.playerId == this.getPlayerId()) {
			document.getElementById('boat-choice').remove()
		}
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
			this.addKnownShape(shape)
			this.islandMgr.discardShapeId(shape.shapeId)
		}
	}
	notif_NTF_SCORE_BOAT_POSITION(notif) {
		this.updatePlayerScore(notif.args.player_id, notif.args.totalScore, notif.args.scoreColumn, notif.args.score)
		this.boatMgr.showScoreBoatPosition(notif.args.player_id, notif.args.scoreBoatPosition)
	}

	notif_oshaxMove(notif: Notif<NotifOshaxMoveArgs>) {
		log('notif_oshaxMove', notif.args)
		this.island.refreshOshaxLocation(notif.args.to)
	}

	notif_materialMove(notif: Notif<NotifMaterialMove>) {
		log('notif_materialMove', notif)
		switch (notif.args.type) {
			case 'CARD':
				const cards = notif.args.material as Array<TheIsleOfCatsDuelCard>
				this.notif_cardMove(cards, notif)
				break
			default:
				console.error('Material type move not handled', notif)
				break
		}
	}

	notif_cardMove(cards: TheIsleOfCatsDuelCard[], notif: Notif<NotifMaterialMove>) {
		switch (notif.args.to) {
			case 'HAND':
				this.playerTables[notif.args.toArg].handStock.addCards(cards)
				break
			case 'DISCARD':
				cards.forEach((card) => {
					this.cardsManager.getCardStock(card)?.removeCard(card)
				})
				break

			default:
				console.error('Card move destination not handled', notif)
				break
		}
	}

	updatePlayerScore(playerId, newScore, scoreColumn, scoreColumnScore, animate = true) {
		log('updatePlayerScore', playerId, newScore, scoreColumn, scoreColumnScore)
		if (animate) {
			this.gameui.scoreCtrl[playerId].toValue(newScore)
		} else {
			this.gameui.scoreCtrl[playerId].setValue(newScore)
		}
		this.buildScoreTable()
		let neg = 1
		if (scoreColumn == 'score_rats' || scoreColumn == 'score_unfilled_rooms') {
			neg = -1
		}
		if (animate) {
			this.scoreTable[scoreColumn][playerId].toValue(neg * scoreColumnScore)
			this.scoreTable['score_total'][playerId].toValue(newScore)
		} else {
			this.scoreTable[scoreColumn][playerId].setValue(neg * scoreColumnScore)
			this.scoreTable['score_total'][playerId].setValue(newScore)
		}
	}
	buildScoreTable() {
		const tableElem = document.getElementById('tioc-score-table')
		if (!tableElem.classList.contains('tioc-hidden')) {
			return
		}
		tableElem.classList.remove('tioc-hidden')

		// Header
		const headElem = tableElem.querySelector('thead')
		const firstRow = document.createElement('tr')
		firstRow.appendChild(document.createElement('th'))
		headElem.appendChild(firstRow)
		//const firstRowElem = headElem.insertAdjacentHTML("afterbegin",'<tr><th></th></tr>')
		let nbPlayers = 0
		for (const playerId in this.gamedatas.players) {
			++nbPlayers
			const player = this.gamedatas.players[playerId]
			firstRow.insertAdjacentHTML(
				'beforeend',
				'<td style="color: #' + player.color + ';">' + player.name + '</td>'
			)
		}

		const bodyElem = tableElem.querySelector('tbody')

		const dataArray = [
			{ title: _('Rats'), col: 'score_rats', cssClass: '' },
			{ title: _('Rooms') + '<sup>*</sup>', col: 'score_unfilled_rooms', cssClass: '' },
			{ title: _('Cat Families'), col: 'score_cat_familly', cssClass: '' },
			{ title: _('Lessons'), col: 'score_lessons', cssClass: '' },
			{ title: _('Total'), col: 'score_total' }
		]
		this.scoreTable = {}
		for (const data of dataArray) {
			const elem = dojo.place("<tr class='" + data.cssClass + "'><th>" + data.title + '</th></tr>', bodyElem)
			if (!(data.col in this.scoreTable)) {
				this.scoreTable[data.col] = {}
			}
			for (const playerId in this.gamedatas.players) {
				dojo.place('<td id="tioc-' + data.col + '-' + playerId + '">0</td>', elem)
				this.scoreTable[data.col][playerId] = new ebg.counter()
				this.scoreTable[data.col][playerId].create('tioc-' + data.col + '-' + playerId)
				this.scoreTable[data.col][playerId].setValue(0)
			}
		}
		dojo.place(
			"<tr><th colspan='" +
				(1 + nbPlayers) +
				"'>" +
				'<small>*<i>' +
				_('There are 7 rooms: the deck of the boat (the room with no icons) counts as a room') +
				'</i></small></th></tr>',
			bodyElem
		)
	}
	displayBigScore(parentElem: string, playerId: number, score: string | number, x: number = null, y: number = null) {
		this.gameui.displayScoring(parentElem, this.getPlayerColor(playerId), score, 1000, x, y)
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

	/**
	 * Create a shape element and place it according to its location.
	 * Be careful to pass an element as the location if this is a boat cell since they have the same id on both boats
	 * @param {string|HTMLElement} location - the location to place the shape element
	 * @param {number} shapeId - the id of the shape to create
	 * @param {number} shapeTypeId - the type id of the shape to create
	 * @param {number} shapeDefId - the definition id of the shape to create
	 * @param {number} [colorId = null] - the color id of the shape to create
	 * @returns {HTMLElement} the created shape element
	 */
	public createShapeElement(
		location: string | HTMLElement,
		shapeId,
		shapeTypeId,
		shapeDefId,
		colorId = null
	): HTMLElement {
		dojo.place(this.formatShapeElement(shapeId, shapeTypeId, shapeDefId, colorId), location)
		this.updateTooltipsNow()
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
		const jstpl_tooltip_shape = `<h3>${title}</h3> <p>${description}</p><p>${color}</p>`
		this.gameui.addTooltipHtml(elementId, jstpl_tooltip_shape, this.TOOLTIP_DELAY)
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
