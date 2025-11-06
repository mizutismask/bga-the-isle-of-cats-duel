class Island {
	constructor(private game: TheIsleOfCatsDuelGame) {
		const container = document.createElement('div')
		container.id = `island`
		game.gameui.getGameAreaElement().appendChild(container)

		for (let i = 1; i <= 15; i++) {
			const island = document.createElement('div')
			island.id = `island-slot-${i}`
			island.classList.add('island-slot')
			island.dataset.slotId = '' + i
			container.appendChild(island)
		}

		;[1, 3, 5, 6, 7, 8, 9, 10, 12, 14].forEach((i) => {
			container.querySelector(`#island-slot-${i}`).classList.add('island-cat-slot')
		})
		;[2, 4, 11, 13, 15].forEach((i) => {
			container.querySelector(`#island-slot-${i}`).classList.add('island-card-slot')
		})
	}
}
