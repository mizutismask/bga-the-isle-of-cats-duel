/**
 * Your game interfaces
 */
type PowerType = 'C' | 'B' | 'N'

// remove this if you don't use cards. If you do, make sure the types are correct . By default, some number are send as string, I suggest to cast to right type in PHP.
interface Card {
	cardId: number
	cardLocationId: string
	location_arg: number
	cardTypeId: number
	type_arg: number
}
interface TheIsleOfCatsDuelCard extends Card {
	name: string //translated
	islandCardSlot: number
}

interface Shape {
	shapeId: number
	shapeTypeId: number
	shapeDefId: number
	shapeLocationId: number
	colorId?: number
	islandCatSlot?: number
}

interface TheIsleOfCatsDuelPlayer extends Player {
	playerNo: number
	lessonsCount: number
	tickets: number
	hand: Array<TheIsleOfCatsDuelCard>
	fish: number
	boatShape: BoatShape
	scoreCatFamily?: number
	scoreLessons?: number
	scoreRats?: number
	scoreUnfilledRooms?: number
}

type BoatShape = 'OBoat' | 'IBoat'

interface TheIsleOfCatsDuelGamedatas {
	current_player_id: string
	decision: { decision_type: string }
	game_result_neutralized: string
	gamestate: Gamestate
	gamestates: { [gamestateId: number]: Gamestate }
	neutralized_player_id: string
	notifications: { last_packet_id: string; move_nbr: string }
	playerorder: (string | number)[]
	playerOrderWorkingWithSpectators: number[] //starting with current player
	players: { [playerId: number]: TheIsleOfCatsDuelPlayer }
	tablespeed: string
	lastTurn: boolean
	turnOrderClockwise: boolean
	expansion: number
	// counters
	scores?: Array<NotifScoreArgs>
	winners: number[]
	version: string
	counters: Map<string, CounterValue>
	// Add here variables you set up in getAllDatas
	islandCards: Array<TheIsleOfCatsDuelCard>
	oshaxLocation: number
	shapes: any //todo type
	boatUsedGridColor: any
	boatsChosen: boolean
}

interface BoatCell {
	x: number
	y: number
	colorId: number | null
	shapeId: number
}

interface CounterValue {
	counter_name: string
	counter_value: number
}

interface TheIsleOfCatsDuelGame /*extends Game*/ {
	cardsManager: CardsManager
	actionMgr: ActionMgr
	animationManager: AnimationManager
	tryShapesMgr: TryShapesMgr
	getCurrentPlayer(): TheIsleOfCatsDuelPlayer
	getPlayerId(): number
	getPlayerScore(playerId: number): number
	setTooltip(id: string, html: string): void
	setTooltipToClass(className: string, html: string): void
	clientActionData: ClientActionData
	resetClientActionData(): void
	handSelectionChange(selection: TheIsleOfCatsDuelCard[], lastChange: TheIsleOfCatsDuelCard): void
	takeAction(action: string, data?: any, options?: { lock: boolean; checkAction: boolean }): Promise<void>
	clickOnSlot(slot: number): any
	gameui: GameGui
	gamedatas: TheIsleOfCatsDuelGamedatas
	
	commandMgr: CommandMgr
	//fishMgr: FishMgr
	islandMgr: IslandMgr
	boatMgr: BoatMgr
	//phase45Mgr: Phase45Mgr
	shapeControl: ShapeControl
	normalizeRotation(rotation: number): number
	forEachShapeGrid(shapeId, x, y, rotation, paramFlipH, paramFlipV, gridFunction): void
	removeClickable(element: HTMLElement, removeSelected = true): void
	closeAllTooltips: () => void
	addOnClick: (elem: Element, fct: (ev: any) => void) => void
	changeParent(mobile: string | HTMLElement, new_parent: string | HTMLElement, relation: string = 'last')
	getShapeColorFromShapeId: (shapeId: string) => string
	getShapeSizeFromShapeId(shapeId: string)
	getShapeHeightFromShapeId(shapeId: number): int
	getShapeDefIdFromShapeId(shapeId)
	getShapeTypeIdFromShapeId(shapeId)
	getShapeColorIdFromShapeId(shapeId)
	applyTransformToElement(element: HTMLElement, rotation: number, flipH: boolean, flipV: boolean)
	removeClickableId(id: string, removeSelected = true)

	createShapeElement(location, shapeId, shapeTypeId, shapeDefId, colorId = null): HTMLElement
	addKnownShape(shape): void
	updateShapeElementTooltip(shape, elementId = null): void
	removeAbsolutePosition(elementId: string)
	displayBigScore(parentElem: string | HTMLElement, playerId: number, score: string | number): void
}

interface EnteringPlayerTurnArgs {
	canTradeFishForMove: boolean
	canTradeFishForJump: boolean
	canTradeFishForTreasure: boolean
	canTradeFishForDiscovery: boolean
	canPass: boolean
	canResetTurn: boolean
	oshaxValidMoves: number[]
	possibleSlotsForDiscovery: number[]
	remainingMoves: number
	remainingTreasures: number
	mandatoryMoveDone: boolean
	shapeToPlace: Shape
}

interface NotifPointsArgs {
	playerId: number
	points: number
	delta: number
	scoreType: string
}

interface NotifScoreArgs {
	playerId: number
	score: number
	scoreType: string
}

interface NotifResetIslandArgs {
	shapes: Shape[]
	cards: TheIsleOfCatsDuelCard[]
}

interface NotifBoatChosenArgs {
	boatShape: BoatShape
	playerId: number
}

interface NotifOshaxMoveArgs {
	to: number
}

interface NotifCounter {
	counterName: string
	counterValue: number
	playerId: number
}

interface NotifUpdateCounters {
	counters: [{ [name: string]: CounterValue }]
}

interface NotifWinnerArgs {
	playerId: number
}

interface NotifScorePointArgs {
	playerId: number
	points: number
}

interface NotifImportantMessageArgs {
	message: string
	type: 'POSITIVE' | 'NEGATIVE' | 'WARNING'
	temporary: boolean
}

type MoveLocation = 'HAND' | 'DECK' | 'STOCK' | 'TABLE' | 'DISCARD' | 'BAG'

interface NotifMaterialMove {
	type: 'CARD' | 'TOKEN' | 'FIRST_PLAYER_TOKEN' | 'SHAPE'
	from: MoveLocation
	to: MoveLocation
	fromArg: number
	toArg: number
	material: Array<any | string> //elements (cards for exemple), or tokenIds
}

interface SwappedMaterial {
	from: 'HAND' | 'DECK' | 'FESTIVAL'
	to: 'HAND' | 'DECK' | 'FESTIVAL'
	fromArg: number
	toArg: number
	material: any | string
}

type MaterialType = 'CARD' | 'TOKEN' | 'FIRST_PLAYER_TOKEN'

interface NotifMaterialSwap {
	type: MaterialType
	material1: SwappedMaterial
	material2: SwappedMaterial
}

interface ClientActionData {
	placedCardId: string
	destinationSquare: string
	previousCardParentInHand: HTMLElement
}
