/**
 * Player table.
 */
class PlayerTable {
	private handStock: LineStock<TheIsleOfCatsDuelCard>

	constructor(private game: TheIsleOfCatsDuelGame, player: TheIsleOfCatsDuelPlayer, cards: TheIsleOfCatsDuelCard[]) {
		const isMyTable = player.id === game.getPlayerId()
		const ownClass = isMyTable ? 'own' : ''
		let html = `
			<a id="anchor-player-${player.id}"></a>
            <div id="player-table-${player.id}" class="player-order${player.playerNo} player-table ${ownClass}">
				<span class="player-name" style="color:#${player.color}">${player.name}</span>
            </div>
        `
		dojo.place(html, 'player-tables')

		if (isMyTable) {
			const handHtml = `
			<div id="hand-${player.id}" class="cstm-player-hand"></div>
        `
			dojo.place(handHtml, `player-table-${player.id}`, 'first')
			this.initHand(player, cards)
		}
	}

	private initHand(player: TheIsleOfCatsDuelPlayer, cards: TheIsleOfCatsDuelCard[] = []) {
		this.handStock = new BgaCards.LineStock<TheIsleOfCatsDuelCard>(
			this.game.cardsManager,
			$('hand-' + player.id),
			{}
		)
		this.handStock.setSelectionMode('single')
		if (cards) {
			this.handStock.addCards(cards)
		}
	}
}
