/**
 * Player table.
 */
class PlayerTable {
	private handStock: LineStock<TheIsleOfCatsDuelCard>

	constructor(private game: TheIsleOfCatsDuelGame, player: TheIsleOfCatsDuelPlayer, cards: TheIsleOfCatsDuelCard[]) {
		const isMyTable = player.id === game.getPlayerId()
		const ownClass = isMyTable ? 'own' : ''
		let html = `
            <div id="player-table-${player.id}" class="player-order${player.playerNo} player-table ${ownClass}">
            </div>
        `
		dojo.place(html, 'player-tables')

		const boatHtml = (PLAYER_ID: number, PLAYER_COLOR: string, PLAYER_NAME: string) => `
<div id="tioc-player-board-${PLAYER_ID}" class="whiteblock">
    <div class="tioc-player-name-row">
        <h3 class="tioc-player-name" style="color: #${PLAYER_COLOR};">${PLAYER_NAME}</h3>
    </div>
    <div class="tioc-basket-private-lesson-boat-wrap">
        <div class="tioc-private-lesson-boat-wrap">
            <div class="tioc-player-top-shapes-boat-wrap">
                <div class="tioc-player-boat-wrap-wrap">
                    <div class="tioc-player-boat-wrap">
                        <div id="tioc-top-shapes-${PLAYER_ID}" class="tioc-top-shapes tioc-hidden">
                            <div id="tioc-top-shapes-left-${PLAYER_ID}"></div>
                            <div id="tioc-top-shapes-middle-${PLAYER_ID}" class="tioc-top-shapes-middle"></div>
                            <div id="tioc-top-shapes-right-${PLAYER_ID}"></div>
                        </div>
                        <div id="tioc-player-boat-${PLAYER_ID}" class="tioc-player-boat">
                            <a href="#" class="action-button bgabutton bgabutton_blue tioc-player-boat-hide-overlay" onclick="return false;" id="tioc-player-boat-hide-overlay-${PLAYER_ID}" data-player-id="${PLAYER_ID}"></a>
                            <a href="#" class="action-button bgabutton bgabutton_blue tioc-player-boat-hide-shapes" onclick="return false;" id="tioc-player-boat-hide-shapes-${PLAYER_ID}" data-player-id="${PLAYER_ID}"></a>
                            <div class="tioc-player-boat-legend-score" id="tioc-player-boat-legend-score-${PLAYER_ID}"></div>
                            <div class="tioc-player-boat-legend-round" id="tioc-player-boat-legend-round-${PLAYER_ID}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`
		dojo.place(boatHtml(player.id, player.color, player.name), `player-table-${player.id}`, 'last')

		const handHtml = `
			<div id="hand-${player.id}" class="cstm-player-hand"></div>
        `
		dojo.place(handHtml, `player-table-${player.id}`, 'first')
		this.initHand(player, cards)
	}

	private initHand(player: TheIsleOfCatsDuelPlayer, cards: TheIsleOfCatsDuelCard[] = []) {
		log('initHand', player, cards)
		this.handStock = new BgaCards.LineStock<TheIsleOfCatsDuelCard>(
			this.game.cardsManager,
			$('hand-' + player.id),
			{}
		)
		this.handStock.setSelectionMode('none')
		if (cards) {
			this.handStock.addCards(cards)
		}
	}
}
