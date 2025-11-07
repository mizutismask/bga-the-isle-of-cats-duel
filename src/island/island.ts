class Island {
	private cardsSlots: CardStock<TheIsleOfCatsDuelCard>[]=[]
	constructor(private game: TheIsleOfCatsDuelGame, gamedatas: TheIsleOfCatsDuelGamedatas) {
		const container = document.getElementById('island')

		for (let i = 1; i <= 15; i++) {
			const islandSlot = document.createElement('div')
			islandSlot.id = `island-slot-${i}`
			islandSlot.classList.add('island-slot')
			islandSlot.dataset.slotId = '' + i
			container.appendChild(islandSlot)

			islandSlot.addEventListener('click', (evt) => {
				if (evt.detail > 1) return
				this.game.moveOshaxToSlot(parseInt(islandSlot.dataset.slotId))
			})
		}

		;[1, 3, 5, 6, 7, 8, 9, 10, 12, 14].forEach((i) => {
			container.querySelector(`#island-slot-${i}`).classList.add('island-cat-slot')
		})
		;[2, 4, 11, 13, 15].forEach((id, i) => {
			const cardSlot = container.querySelector(`#island-slot-${id}`) as HTMLElement
			cardSlot.classList.add('island-card-slot')
			cardSlot.classList.add(`island-card-slot-${i+1}`)
		})
		for (let i = 1; i <= 5; i++) {
			const cardSlot = container.querySelectorAll(`.island-card-slot`)[i - 1] as HTMLElement
			this.cardsSlots[i] = new BgaCards.LineStock<TheIsleOfCatsDuelCard>(this.game.cardsManager, cardSlot)
		}
		gamedatas.islandCards.forEach((card) => {
			this.cardsSlots[card.islandCardSlot].addCard(card)
		})
		
		const oshax = document.createElement('div')
		oshax.id = `oshax`
		oshax.classList.add('oshax')
		container.querySelector(`#island-slot-${gamedatas.oshaxLocation}`).appendChild(oshax)
	}

	public refreshOshaxLocation(slotNumber: number) {
		const from = document.getElementById('oshax')
		const to = document.getElementById(`island-slot-${slotNumber}`)
		if (this.game.animationManager.animationsActive) {
			this.game.animationManager.slideAndAttach(from, to, { preserveScale: true })
		} else {
			to.appendChild(from)
		}
	}

	public enableSlots(slotNumbers: number[]) {
		document.getElementById('island').querySelectorAll('.island-slot').forEach(slot=>slot.classList.add('island-slot-disabled'))
		slotNumbers.forEach((slotNumber) => {
			document.getElementById(`island-slot-${slotNumber}`).classList.remove('island-slot-disabled')
		})
	}
}
