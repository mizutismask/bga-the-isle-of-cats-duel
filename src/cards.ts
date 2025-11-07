// <reference path="../card-manager.ts"/>
const IMAGE_ITEMS_PER_ROW = 10

class CardsManager extends CardsManagerBase<TheIsleOfCatsDuelCard> {
	constructor(public game: TheIsleOfCatsDuelGame) {
		super({
			animationManager: game.animationManager,
			type: 'card',
			getId: (card) => `theisleofcatsduel-card-${card.cardId}`,
			cardWidth: 118,
			cardHeight: 165,
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
}
