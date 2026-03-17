class Island {
	private cardsSlots: CardStock<TheIsleOfCatsDuelCard>[] = []

	constructor(
		private game: TheIsleOfCatsDuelGame,
		gamedatas: TheIsleOfCatsDuelGamedatas
	) {
		const container = document.getElementById('island')

		for (let i = 1; i <= 15; i++) {
			const islandSlot = document.createElement('div')
			islandSlot.id = `island-slot-${i}`
			islandSlot.classList.add('island-slot')
			islandSlot.dataset.slotId = '' + i
			container.appendChild(islandSlot)

			islandSlot.addEventListener('click', (evt) => {
				if (evt.detail > 1) return
				if (islandSlot.classList.contains('island-slot-disabled')) return
				if (
					this.game.gamedatas.gamestate.args.remainingMoves == 0 &&
					!islandSlot.querySelector('.tioc-shape') &&
					!islandSlot.querySelector('.theisleofcatsduel-card')
				)
					return
				this.game.clickOnSlot(parseInt(islandSlot.dataset.slotId))
			})
		}

		;[1, 3, 5, 6, 7, 8, 9, 10, 12, 14].forEach((id, i) => {
			container.querySelector(`#island-slot-${id}`).classList.add('island-cat-slot', `island-cat-slot-${i + 1}`)
		})
		;[2, 4, 11, 13, 15].forEach((id, i) => {
			const cardSlot = container.querySelector(`#island-slot-${id}`) as HTMLElement
			cardSlot.classList.add('island-card-slot')
			cardSlot.classList.add(`island-card-slot-${i + 1}`)
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

	public hasSlotSomethingToTake(slotNumber: number): boolean {
		const islandSlot = document.getElementById(`island-slot-${slotNumber}`)
		return (
			islandSlot.querySelector('.tioc-shape') != null ||
			islandSlot.querySelector('.theisleofcatsduel-card') != null
		)
	}

	public isCardSlot(slotId: number): boolean {
		return [2, 4, 11, 13, 15].includes(slotId)
	}

	public refreshOshaxLocation(slotNumber: number) {
		const from = document.getElementById('oshax')
		const to = document.getElementById(`island-slot-${slotNumber}`)
		if (this.game.animationManager.animationsActive) {
			from.classList.add('moving-oshax')
			this.game.animationManager
				.slideAndAttach(from, to, { preserveScale: true })
				.then(() => from.classList.remove('moving-oshax'))
		} else {
			to.appendChild(from)
		}
	}

	public enableSlots(slotNumbers: number[]) {
		this.disableAllSlots(true)
		slotNumbers.forEach((slotNumber) => {
			const card = document.getElementById(`island-slot-${slotNumber}`)
			card.classList.remove('island-slot-disabled')
			//this.game.addOnClick(card, () => this.game.actionMgr.rescueCat('toto'))
		})
	}
	public showCrossedSlots(slotNumbers: number[]) {
		removeClass('island-slot-crossed')
		slotNumbers.forEach((slotNumber) => {
			const card = document.getElementById(`island-slot-${slotNumber}`)
			card.classList.add('island-slot-crossed')
		})
	}

	public resetIsland(cards: Array<TheIsleOfCatsDuelCard>, shapes: Array<Shape>) {
		this.disableAllSlots(false)
		this.cardsSlots.forEach((cardSlot) => cardSlot.removeAll())
		cards.forEach((card) => this.cardsSlots[card.islandCardSlot].addCard(card))
		document.querySelectorAll('#island .tioc-shape').forEach((shape) => shape.remove())
		//this.game.islandMgr.emptyIsland()
		shapes.forEach((shape) => this.game.islandMgr.createAndPlaceShape(shape, false))
	}

	private disableAllSlots(disable: boolean) {
		document
			.getElementById('island')
			.querySelectorAll('.island-slot')
			.forEach((slot) => slot.classList.toggle('island-slot-disabled', disable))
	}
}
