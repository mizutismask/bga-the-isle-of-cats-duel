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
class TheIsleOfCatsDuel extends BaseGame implements TheIsleOfCatsDuelGame {
	public cardsManager: CardsManager
	private originalTextChooseAction: string
	private island: Island

	private scoreBoard: ScoreBoard
	private ticketsCounters: Counter[] = []
	private handCardsCounters: Counter[] = []

	protected settings = [new Setting('customSounds', 'pref', 1)]
	private displayedTooltip

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

		this.gameui.getGameAreaElement().insertAdjacentHTML(
			'beforeend',
			`<div id="boat-choice">
			<div class="boat IBoat"></div>
			<div class="boat OBoat"></div>
			</div>`
		)

		// Example to add a div on the game area
		this.gameui.getGameAreaElement().insertAdjacentHTML(
			'beforeend',
			`
			<div id="player-tables"></div>
            `
		)
		this.island = new Island(this, gamedatas)

		// Setting up player boards
		Object.values(this.gamedatas.players).forEach((player) => {
			// example of setting up players boards
			this.gameui.getPlayerPanelElement(player.id).insertAdjacentHTML(
				'beforeend',
				`
                    <span id="fish-player-counter-${player.id}"></span> Fishes
                `
			)
			const counter = new ebg.counter()
			counter.create(`fish-player-counter-${player.id}`, {
				value: player.fish,
				playerCounter: 'fish',
				playerId: player.id
			})

			// example of adding a div for each player
			document.getElementById('player-tables').insertAdjacentHTML(
				'beforeend',
				`
                    <div id="player-table-${player.id}">
                        <strong>${player.name}</strong>
                        <div>Player zone content goes here</div>
                    </div>
                `
			)
		})

		Object.values(this.gamedatas.playerOrderWorkingWithSpectators).forEach((p) => {
			//this.setupPlayer(this.gamedatas.players[p])
		})
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
		this.playerTables[player.id] = new PlayerTable(
			this,
			player,
			Number(player.id) === this.getPlayerId() ? this.gamedatas.hand : []
		)
	}

	private setupMiniPlayerBoard(player: TheIsleOfCatsDuelPlayer) {
		const playerId = Number(player.id)
		this.gameui.getPlayerPanelElement(playerId).insertAdjacentHTML(
			'afterbegin',
			`<div id="counters-${player.id}" class="counters">
				<div id="tickets-counter-${player.id}-wrapper" class="counter tickets-counter">
					<div class="icon expTicket"></div> 
					<span id="tickets-player-counter-${player.id}"></span>
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
		const ticketsCounter = new ebg.counter()
		ticketsCounter.create(`tickets-player-counter-${player.id}`, {
			value: player.tickets,
			playerCounter: 'tickets',
			playerId: playerId
		})
		this.ticketsCounters[playerId] = ticketsCounter

		const cardsCounter = new ebg.counter()
		cardsCounter.create(`hand-cards-counter-${player.id}`)
		cardsCounter.setValue(player.cardsCount)
		this.handCardsCounters[playerId] = cardsCounter
	}

	private setupHelpPopin() {
		new HelpManager(this, {
			buttons: [
				new BgaHelpPopinButton({
					title: _('Roles in play'),
					html: this.getHelpHtml(),
					buttonBackground: 'white',
					buttonColor: '#266059'
				}),
				new BgaHelpExpandableButton({
					unfoldedHtml: `<div id="player-help-visible-wrapper" >
										<div id="player-help-visible" class="player-help-visible" style="margin: 5px;" data-player-color="${
											this.getCurrentPlayer()?.color ?? 'fff'
										}"></div>
									</div>`,
					//foldedHtml: `?`,
					expandedWidth: '250px',
					expandedHeight: '182px',
					expandedRadius: '3%',
					foldedContentExtraClasses: 'button-help-expandable'
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
			if (log && args && !args.processed) {
				args.processed = true

				//displays gems
				;['gemType'].forEach((field) => {
					if (typeof args[field] === 'number') {
						args[field] = `<span class="log-icon gem gem-${args[field]}"></span>`
					}
				})
			}
		} catch (e) {
			console.error(log, args, 'Exception thrown', e.stack)
		}
		return { log, args }
	}

	///////////////////////////////////////////////////
	//// Game & client states

	// onEnteringState: this method is called each time we are entering into a new game state.
	//                  You can use this method to perform some user interface changes at this moment.
	//
	public onEnteringState(stateName: string, args: any) {
		log('Entering state: ' + stateName, args)

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
		if (this.gameui.isCurrentPlayerActive()) {
			this.resetClientActionData()
			this.island.enableSlots(args.oshaxValidMoves)
			if (args.remainingMoves > 0) {
				//nothing
			} else if (args.mandatoryMoveDone) {
				this.setChooseActionGamestateDescription(
					_('${you} can select one discovery and/or use fish or end your turn')
				)
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

			case 'dummmy':
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
					this.statusBar.addActionButton(
						_('Choose the first boat'),
						() => this.takeAction('actChooseBoat', { boat: 'OBoat' }),
						{}
					)
					this.statusBar.addActionButton(
						_('Choose the second boat'),
						() => this.takeAction('actChooseBoat', { boat: 'IBoat' }),
						{}
					)
					break
			}
		}
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
			this.statusBar.addActionButton(_('End my turn'), () => this.pass())
		}

		if (chooseActionArgs.canResetTurn) {
			this.statusBar.addActionButton(_('Reset my turn'), () => this.takeAction('actResetPlayerTurn'), {
				color: 'alert',
				title: _('Reset your entire round')
			})
		}
	}

	public moveOshaxToSlot(slot: number) {
		if (
			this.gameui.isCurrentPlayerActive() &&
			this.gamedatas.gamestate.name == 'PlayerTurn' &&
			this.gamedatas.gamestate.args.remainingMoves > 0
		) {
			this.takeAction('actMoveOshax', { slot: slot })
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
			['updateCounters', 1]
		]

		notifs.forEach((notif) => {
			dojo.subscribe(notif[0], this, `notif_${notif[0]}`)
			//comment to prevent formating to glue these 2 lines
			;(this.gameui as any).notifqueue.setSynchronous(notif[0], notif[1])
		})
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
}
