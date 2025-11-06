class Island {
	constructor(private game: TheIsleOfCatsDuelGame, gamedatas: TheIsleOfCatsDuelGamedatas) {
		const container = document.createElement('div')
		container.id = `island`
		game.gameui.getGameAreaElement().appendChild(container)

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
		;[2, 4, 11, 13, 15].forEach((i) => {
			container.querySelector(`#island-slot-${i}`).classList.add('island-card-slot')
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
}
