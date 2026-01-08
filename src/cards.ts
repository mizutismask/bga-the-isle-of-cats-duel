// <reference path="../card-manager.ts"/>
const IMAGE_ITEMS_PER_ROW = 10

const CARD_TYPE_ID_ANYTIME = 2
const CARD_TYPE_ID_TREASURE = 3
const CARD_TYPE_ID_LESSON = 4

class CardsManager extends CardsManagerBase<TheIsleOfCatsDuelCard> {
	constructor(public game: TheIsleOfCatsDuelGame) {
		super({
			animationManager: game.animationManager,
			type: 'card',
			getId: (card) => `theisleofcatsduel-card-${card.cardId}`,
			cardWidth: 108,
			cardHeight: 164,
			cardBorderRadius: '10px',

			setupDiv: (card: TheIsleOfCatsDuelCard, div: HTMLElement) => {
				div.classList.add('theisleofcatsduel-card')
				div.dataset.cardId = '' + card.cardId
			},
			setupFrontDiv: (card: TheIsleOfCatsDuelCard, div: HTMLElement) => {
				this.setFrontBackground(div as HTMLDivElement, card.cardId)

				const textId = `${super.getId(card)}-text`
				div.id = `${super.getId(card)}-front`

				//add help
				const helpId = `${super.getId(card)}-front-info`
				if (!$(helpId)) {
					const info: HTMLDivElement = document.createElement('div')
					info.id = helpId
					info.innerText = '?'
					info.classList.add('css-icon', 'card-info')
					div.appendChild(info)
					const tooltipContent = this.getTooltip(card)
					this.game.gameui.addTooltipHtml(div.id, tooltipContent)
					this.game.addTooltipOnClickHelpButton(info.id, tooltipContent)
				}

				if (!$(textId)) {
					const container: HTMLDivElement = document.createElement('div')
					container.id = textId
					container.classList.add('bga-autofit', 'card-text-wrapper')
					div.appendChild(container)
				}
			},
			setupBackDiv: (card: TheIsleOfCatsDuelCard, div: HTMLElement) => {
				div.style.backgroundImage = `url('${g_gamethemeurl}img/theisleofcatsduel-card-background.jpg')`
			},
			isCardVisible: (card) => (card.cardId ?? 0) !== 0
		})
	}

	public getCardName(card: TheIsleOfCatsDuelCard) {
		return `<div class="cstm-card-name">${card.name}</div>`
	}

	public getTooltipContent(): TooltipElement[] {
		return [{ title: _('Objective'), contentProvider: (c: TheIsleOfCatsDuelCard) => this.getDesc(c) }]
	}

	public getDesc(card: TheIsleOfCatsDuelCard) {
		return 'todo'
	}

	private setFrontBackground(cardDiv: HTMLDivElement, cardType: number) {
		const imageUrl = `${g_gamethemeurl}img/cards.jpg`
		cardDiv.style.backgroundImage = `url('${imageUrl}')`
		const imagePosition = cardType - 1
		const row = Math.floor(imagePosition / IMAGE_ITEMS_PER_ROW)
		const xBackgroundPercent = (imagePosition - row * IMAGE_ITEMS_PER_ROW) * 100
		const yBackgroundPercent = row * 100
		cardDiv.style.backgroundPositionX = `-${xBackgroundPercent}%`
		cardDiv.style.backgroundPositionY = `-${yBackgroundPercent}%`
		cardDiv.style.backgroundSize = `${IMAGE_ITEMS_PER_ROW * 100}%`
	}

	public getCardTypeNameFromCardId(card: TheIsleOfCatsDuelCard) {
		switch (card.cardTypeId) {
			case CARD_TYPE_ID_TREASURE:
				return _('Treasure')
			case CARD_TYPE_ID_LESSON:
				return _('Lesson')
			case CARD_TYPE_ID_ANYTIME:
				return _('Instant')
		}
	}

	public getDescriptionAndNoteFromCardId(cardId) {
		switch (parseInt(cardId)) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				return {
					description: _('Take any 2 treasures.'),
					note: ''
				}
			case 7:
				return {
					description: _('Take 1 tile from the bag at random and immediately place it on your boat.'),
					note: ''
				}
			case 8:
				return {
					description: _('Gain 1 fish (max 3) for each unique coloured cat on your boat.'),
					note: ''
				}
			case 9:
				return {
					description: _('Gain 1 fish (max 3) for each treasure on your boat.'),
					note: ''
				}
			case 10:
				return {
					description: _(
						'Pick a color (Done automatically in your greatest interest). Gain 1 fish (max 3) for each cat of the chosen color on your boat.'
					),
					note: ''
				}
			case 11:
				return {
					description: _('12 points if there are no empty spaces at the edge of your boat.'),
					note: ''
				}
			case 12:
				return {
					description: _('15 points if you have 3 or more cats of each colour on your boat.'),
					note: ''
				}
			case 13:
				return {
					description: _('7 points if you have 1 or more of each colour cat touching the edge of your boat.'),
					note: ''
				}
			case 14:
				return {
					description: _('2 points per lonely cat on your boat.'),
					note: _('A lonely cat is a cat that is not touching any another cats of the same colour.')
				}
			case 15:
				return {
					description: _('7 points if you have the largest family of cats of your boat.'),
					note: _('In the case of a tie, you get the points.')
				}
			case 16:
				return {
					description: _('1 point per treasure on your boat.'),
					note: ''
				}
			case 17:
				return {
					description: _('9 points if you have exactly 5 blue cats on your boat.'),
					note: ''
				}
			case 18:
				return {
					description: _('9 points if you have exactly 5 green cats on your boat.'),
					note: ''
				}
			case 19:
				return {
					description: _('9 points if you have exactly 5 purple cats on your boat.'),
					note: ''
				}
			case 20:
				return {
					description: _('9 points if you have exactly 5 red cats on your boat.'),
					note: ''
				}
			case 21:
				return {
					description: _('9 points if you have exactly 5 orange cats on your boat.'),
					note: ''
				}
			case 22:
				return {
					description: _('12 points if you have exactly 5 visible rats on your boat.'),
					note: ''
				}
			case 23:
				return {
					description: _('9 points if you have exactly 5 treasures on your boat.'),
					note: ''
				}
			case 24:
				return {
					description: _('2 point per 2 cats touching the edge of your boat.'),
					note: ''
				}
			case 25:
				return {
					description: _('Score your third largest family twice.'),
					note: _('In the case of equal sized families, your third largest family may be the same size as your largest or second largest families.')
				}
			case 26:
				return {
					description: _('7 points if you have the most treasures.'),
					note: _('In the case of a tie, you get the points.')
				}
			case 27:
				return {
					description: _('12 points if you have exactly 2 visible treasure maps.'),
					note: ''
				}
			case 28:
				return {
					description: _('12 points if you have exactly 18 cats on your boat.'),
					note: ''
				}
			case 29:
				return {
					description: _('12 points if you have exactly 2 families that are the same size.'),
					note: ''
				}
			case 30:
				return {
					description: _('2 points for every red or blue cat on your boat, whichever you have fewer of.'),
					note: ''
				}
			case 31:
				return {
					description: _('2 points for every orange or green cat on your boat, whichever you have fewer of.'),
					note: ''
				}
			case 32:
				return {
					description: _('2 points for every blue or purple cat on your boat, whichever you have fewer of.'),
					note: ''
				}
		}
		return {
			description: 'todo',
			note: 'todo'
		}
	}

	public showScoreCards(playerId, scoreCards) {
		const delay = 200
		let currentDelay = 0
		scoreCards.sort((a, b) => a.cardId - b.cardId)
		for (const scoreCard of scoreCards) {
			const cardElemId = 'card-theisleofcatsduel-card-' + scoreCard.cardId
			const cardElem = document.getElementById(cardElemId)
			setTimeout(() => {
				this.game.displayBigScore(cardElem.id, playerId, scoreCard.score)
				this.addScoreToCardId(scoreCard.cardId, playerId, scoreCard.score)
			}, currentDelay)
			currentDelay += delay
		}
	}
	private addScoreToCardId(cardId, playerId, score) {
		if (score === null) {
			return
		}
		let style = ''
		if (playerId !== null) {
			style = 'color: #' + this.game.gamedatas.players[playerId].color
		}
		const cardElemId = 'card-theisleofcatsduel-card-' + cardId
		dojo.place(`<div class="tioc-card-end-score" style="${style}">+${score}</div>`, cardElemId)
	}

	public getTooltip(card: TheIsleOfCatsDuelCard): string {
		const descNote = this.getDescriptionAndNoteFromCardId(card.cardId)
		const cardTypeName = this.getCardTypeNameFromCardId(card)
		const cardZoom = document.createElement('div')
		cardZoom.classList.add('tioc-card-zoom')
		cardZoom.id = `card-zoom-${card.cardId}`
		this.setFrontBackground(cardZoom, card.cardId)

		const jstpl_tooltip_card = `
				${cardZoom.outerHTML}
				<h3>${cardTypeName} <small>(${card.cardId})</small></h3>
				<p>${descNote.description}</p>
				<p><i>${descNote.note}</i></p>
				`
		return jstpl_tooltip_card
	}
}
