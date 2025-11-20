// <reference path="../card-manager.ts"/>
const IMAGE_ITEMS_PER_ROW = 10

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

	public getCardTypeNameFromCardId(cardId) {
                    /*switch (this.getCardTypeIdFromCardId(cardId)) {
                        
                        case CARD_TYPE_ID_TREASURE:
                            return _('Treasure');
                        case CARD_TYPE_ID_PRIVATE_LESSON:
                            return _('Lesson');
                    }*/
                    return 'todo';
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
					description: _('Take any Oshax and place it on your boat.'),
					note: '',
				}
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
				return {
					description: _('Gain 4 speed'),
					note: '',
				}
			case 15:
			case 16:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
			case 22:
				return {
					description: _('Gain a half basket'),
					note: '',
				}
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
			case 29:
			case 30:
			case 31:
			case 32:
                        
		}
		return {
			description: '',
			note: '',
		}
	}
}
