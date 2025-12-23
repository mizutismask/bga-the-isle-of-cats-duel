<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\StringParam;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;
use Bga\Games\TheIsleOfCatsDuel\TiocCard;

use const Bga\Games\TheIsleOfCatsDuel\CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE;
use const Bga\Games\TheIsleOfCatsDuel\CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE;
use const Bga\Games\TheIsleOfCatsDuel\CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_MAX_COLOR;
use const Bga\Games\TheIsleOfCatsDuel\CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_UNIQUE_CATS;
use const Bga\Games\TheIsleOfCatsDuel\CARD_LOCATION_ID_ISLAND_CARD_SLOT;
use const Bga\Games\TheIsleOfCatsDuel\CARD_LOCATION_ID_ISLAND_CAT_SLOT;
use const Bga\Games\TheIsleOfCatsDuel\NTF_DISCARD_SHAPES;
use const Bga\Games\TheIsleOfCatsDuel\NTF_MOVE_SHAPE_TO_BOAT;
use const Bga\Games\TheIsleOfCatsDuel\NTF_PLAY_AND_DISCARD_CARDS;
use const Bga\Games\TheIsleOfCatsDuel\NTF_UPDATE_FILL_FIELDS;
use const Bga\Games\TheIsleOfCatsDuel\SHAPE_LOCATION_ID_ISLAND_CAT_SLOT;
use const Bga\Games\TheIsleOfCatsDuel\SHAPE_LOCATION_ID_TO_PLACE;
use const Bga\Games\TheIsleOfCatsDuel\SHAPE_TYPE_ID_COMMON_TREASURE;

const FISH_ACTION_COST = [
    "M" => 1,
    "J" => 2,
    "T" => 2,
    "D" => 3,
];

class PlayerTurn extends GameState {



    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 11,
            type: StateType::ACTIVE_PLAYER,
            description: clienttranslate('${actplayer} must move the Oshax'),
            descriptionMyTurn: clienttranslate('You must select where to move the Oshax (${remainingMoves} remaining moves) '),
        );
    }

    function onEnteringState(int $activePlayerId, array $args) {
    }
    /**
     * Game state arguments, example content.
     *
     * This method returns some additional information that is very specific to the `PlayerTurn` game state.
     */
    public function getArgs(): array {
        // Get some values from the current game situation from the database.
        $mandatoryMoveDone = $this->game->globals->get(Constants::GLBL_MANDATORY_MOVE_DONE);
        $discoveryTaken = $this->game->getPlayerGlobal($this->game->getMostlyActivePlayerId(), Constants::GLBL_DISCOVERY_TAKEN);
        return [
            "playableCardsIds" => [1, 2],
            "oshaxValidMoves" => $this->game->islandMgr->getOshaxValidMoves(),
            "remainingMoves" => $this->game->globals->get(Constants::GLBL_REMAINING_OSHAX_MOVES),
            "mandatoryMoveDone" => $mandatoryMoveDone,
            "canPass" => $mandatoryMoveDone,
            "canResetTurn" => $mandatoryMoveDone,
            "currentFishAction" => $this->game->globals->get(Constants::GLBL_CURRENT_FISH_ACTION),
            "possibleSlotsForDiscovery" => $mandatoryMoveDone  && $discoveryTaken == false || $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION,) == "D" ? $this->game->islandMgr->getPossibleSlotsForDiscovery() : [],
            "remainingTreasures" => $this->globals->get(Constants::GLBL_REMAINING_TREASURES, 0),
            "canTradeFishForMove" => FISH_ACTION_COST["M"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForJump" => FISH_ACTION_COST["J"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForTreasure" => FISH_ACTION_COST["T"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForDiscovery" => FISH_ACTION_COST["D"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            'shapeToPlace' => $this->game->shapeMgr->getToPlaceShape($this->game->getMostlyActivePlayerId())
        ];
    }

    /**
     * Player action, example content.
     *
     * In this scenario, each time a player plays a card, this method will be called. This method is called directly
     * by the action trigger on the front side with `bgaPerformAction`.
     *
     * @throws UserException
     */
    #[PossibleAction]
    public function actTakeDiscovery(int $slot, int $activePlayerId, array $args) {
        // check input values
        if (!$this->game->islandMgr->isValidSlot($slot)) {
            throw new UserException('This slot is not valid');
        }

        $validSlots = $args['possibleSlotsForDiscovery'];
        if (!in_array($slot, $validSlots)) {
            throw new UserException('You did not move the Oshax over this location');
        }

        $fishAction = $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        if ($fishAction && ["M", "J"] == $fishAction) {
            throw new UserException('You have to finish your additional move before choosing a discovery');
        }

        if ($this->game->isCardSlot($slot)) {
            $typedSlot = $this->game->getCardSlotFromGlobalSlot($slot);
            $card = $this->game->cardMgr->findByCardLocation(CARD_LOCATION_ID_ISLAND_CARD_SLOT, $typedSlot);
            if ($card->isTreasure()) {
                $this->game->cardMgr->validateAndUseTreasureCard($activePlayerId, $card->cardId);
                $this->globals->inc(Constants::GLBL_REMAINING_TREASURES, 2);
            } else if ($card->isLesson()) {
                $this->game->cardMgr->moveLessonToHand($card->cardId, $activePlayerId);
                $this->game->playerLessonCounter->inc($activePlayerId, 1);
                $this->notify->all("materialMove", '', [
                    'type' => Constants::MATERIAL_TYPE_CARD,
                    'from' => Constants::MATERIAL_LOCATION_ISLAND,
                    'to' => Constants::MATERIAL_LOCATION_HAND,
                    'toArg' => $activePlayerId,
                    'material' => [$card],
                    'notifSender' => __METHOD__,
                ]);
            } else {
                $this->playInstantCard($activePlayerId, $card);
            }
        } else {
            $typedSlot = $this->game->getCatSlotFromGlobalSlot($slot);
            $shape = $this->game->shapeMgr->findByLocation(CARD_LOCATION_ID_ISLAND_CAT_SLOT, $typedSlot);
            $this->game->shapeMgr->moveToToPlaceLocation($shape->shapeId);
        }
        $this->game->setPlayerGlobal($activePlayerId, Constants::GLBL_DISCOVERY_TAKEN, true);

        return PlayerTurn::class;
    }

    private function playInstantCard(int $playerId, TiocCard $card) {
        $this->game->cardMgr->validatePlayAnytimeCard($card->cardId, $playerId);

        switch ($card->cardAnytimeTypeId) {
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->game->shapeMgr->countCommonTreasure($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_MAX_COLOR:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->game->shapeMgr->countMostCommonColor($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_UNIQUE_CATS:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->game->shapeMgr->countUniqueColorNoOshax($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                $drawnShape = $this->game->shapeMgr->drawToToPlaceLocation();
                $this->game->tiocNotifyAllPlayers(
                    NTF_UPDATE_FILL_FIELDS,
                    clienttranslate('${player_name} plays an "Instant" card and draws a new shape ${shapes_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->game->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shapes' => [$drawnShape],
                        'shapes_img' => [$drawnShape],
                    ]
                );

                if (!$this->game->shapeMgr->canPlaceShapeAnywhereOnBoat($playerId, $drawnShape)) {
                    $this->game->shapeMgr->discardShapeId($drawnShape->shapeId);
                    $this->game->tiocNotifyAllPlayers(
                        NTF_DISCARD_SHAPES,
                        clienttranslate('The drawn shape cannot fit on the player boat and is discarded ${shapes_img}'),
                        [
                            'shapes' => [$drawnShape],
                            'shapes_img' => [$drawnShape],
                        ]
                    );
                }
                break;
        }
    }

    private function actionAnytimeCardGainFish($card, $playerId, $gainFish) {
        $allowedAmount = min($gainFish, 3);
        $totalFish = $this->game->playerFishCounter->inc($playerId, $allowedAmount);
        $this->game->tiocNotifyAllPlayers(
            "message",
            clienttranslate('${player_name} plays an Instant card and gains ${fishCount} ${fish_img} fish'),
            [
                'player_id' => $playerId,
                'player_name' => $this->game->loadPlayersBasicInfos()[$playerId]['player_name'],
                'fishCount' => $allowedAmount,
                'fishCountTotal' => $totalFish,
                'fish_img' => '',
            ]
        );
        /*  $this->notify->all("materialMove", '', [
            'type' => Constants::MATERIAL_TYPE_CARD,
            'from' => Constants::MATERIAL_LOCATION_ISLAND,
            'to' => Constants::MATERIAL_LOCATION_DISCARD,
            'material' => [$card],
            'notifSender' => __METHOD__,
        ]);*/
    }


    #[PossibleAction]
    public function actMoveOshax(int $slot, int $activePlayerId, array $args) {
        // check input values
        if (!$this->game->islandMgr->isValidSlot($slot)) {
            throw new UserException('This slot is not valid');
        }

        $validMoves = $args['oshaxValidMoves'];
        if (!in_array($slot, $validMoves)) {
            throw new UserException('You cannot reach this location');
        }

        $fishAction = $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        $remainingMoves = $this->game->globals->get(Constants::GLBL_REMAINING_OSHAX_MOVES);
        if ($fishAction != "J" && $remainingMoves == 0) {
            throw new UserException('You have no remaining move, use a fish to get an additional one');
        }

        $this->game->islandMgr->moveOshaxToSlot($activePlayerId, $slot);

        if ($fishAction == "J") {
            $fishAction = $this->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, null);
        }

        return PlayerTurn::class;
    }

    #[PossibleAction]
    public function actTradeFishForAction(#[StringParam(enum: ['M', 'J', "T", "D"])] $additionalAction, int $activePlayerId, array $args) {
        // check input values
        if (!$args['mandatoryMoveDone']) {
            throw new UserException('You cannot use fish before moving the Oshax');
        }

        if (FISH_ACTION_COST[$additionalAction] > $this->game->playerFishCounter->get($activePlayerId)) {
            throw new UserException('You don’t have enough fish');
        }

        if ($this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION) != null) {
            throw new UserException('You must finish your additional move before using another fish');
        }

        switch ($additionalAction) {
            case 'M':
            case 'J':
                $this->globals->inc(Constants::GLBL_REMAINING_OSHAX_MOVES, 1);
                break;
            case 'T':
                $this->globals->inc(Constants::GLBL_REMAINING_TREASURES, 1);
        }
        if ($additionalAction != "M") {
            $this->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, $additionalAction);
        }
        $this->game->playerFishCounter->inc($activePlayerId, FISH_ACTION_COST[$additionalAction] * -1);
        $this->notify->all("message", clienttranslate('${player_name} trades ${fishCount} ${fish_img} for an additional action: ${action}'), [
            'player_id' => $activePlayerId,
            'player_name' => $this->game->getPlayerName($activePlayerId),
            'action' => $this->getTranslatedAction($additionalAction),
            'fishCount' => FISH_ACTION_COST[$additionalAction],
            'fish_img' => '',
        ]);

        return PlayerTurn::class;
    }

    private function getTranslatedAction(string $fishAction) {
        return match ($fishAction) {
            "M" => clienttranslate("Move"),
            "J" => clienttranslate("Jump"),
            "T" => clienttranslate("Take a treasure"),
            "D" => clienttranslate("Take a discovery"),
            default => "Unknown fish action"
        };
    }

    #[PossibleAction]
    public function actMoveShapeToBoat(string $shapeId, int $x, int $y, int $rotation, int $flipH, int $flipV, int $activePlayerId, array $args) {

        $shape = $this->game->shapeMgr->findByShapeId($shapeId);
        $slot = $shape->islandCatSlot;
        $fromIsland = $shape->shapeLocationId == SHAPE_LOCATION_ID_ISLAND_CAT_SLOT;
        if ($fromIsland) {
            $this->game->dump('*******************slot', $shape);
            if (!$slot || !$this->game->islandMgr->isValidSlot($slot)) {
                throw new UserException('This slot is not valid');
            }
            $validSlots = array_map(fn($s) => $this->game->getCatSlotFromGlobalSlot($s), $args['possibleSlotsForDiscovery']);
            if (!in_array($slot, $validSlots)) {
                throw new UserException('You did not move the Oshax over this location');
            }
        }

        $fishAction = $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        if ($fishAction && ["M", "J"] == $fishAction) {
            throw new UserException('You have to finish your additional move before choosing a discovery');
        }

        $shapeTypeId = $this->game->shapeMgr->getShapeTypeIdFromShapeId($shapeId);
        $isTreasure = $shapeTypeId == SHAPE_TYPE_ID_COMMON_TREASURE;
        $shapePlacement = $this->actionTypePlaceShape($activePlayerId, ["shapeId" => $shapeId, "x" => $x, "y" => $y, "rotation" => $rotation, "flipH" => $flipH, "flipV" => $flipV], $shapeTypeId);
        $authorizedPreviousLocation = in_array($shapePlacement->previousShapeLocationId, [SHAPE_LOCATION_ID_TO_PLACE, SHAPE_LOCATION_ID_ISLAND_CAT_SLOT]);
        $isShapeFromIsland = SHAPE_LOCATION_ID_ISLAND_CAT_SLOT == $shapePlacement->previousShapeLocationId;
        if (!$authorizedPreviousLocation && !($isTreasure && $this->game->getPlayerGlobal($activePlayerId, Constants::GLBL_REMAINING_TREASURES) == 0))
            throw new \BgaVisibleSystemException("BUG! Shape is not to place");
        if ($shapePlacement->matchesMapColor) {
            $this->globals->set(Constants::GLBL_REMAINING_TREASURES, 1);
            //$this->turnActionMgr->allowTakeCommonTreasure($playerId);
        }
        if ($isTreasure) {
            $this->game->globals->inc(Constants::GLBL_REMAINING_TREASURES, -1);
        } else if ($isShapeFromIsland) {
            $this->game->setPlayerGlobal($activePlayerId, Constants::GLBL_DISCOVERY_TAKEN, true);
        }

        $fishAction = $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        if ($fishAction == "D") {
            $fishAction = $this->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, null);
        }

        $this->game->tiocNotifyAllPlayers(
            NTF_MOVE_SHAPE_TO_BOAT,
            $shapePlacement->matchesMapColor
                ? clienttranslate('${player_name} places the drawn shape on their boat, covering a map of matching color ${shape_img}')
                : clienttranslate('${player_name} places the drawn shape on their boat ${shape_img}'),
            [
                'player_id' => $activePlayerId,
                'player_name' => $this->game->loadPlayersBasicInfos()[$activePlayerId]['player_name'],
                'shape' => $shapePlacement->shape,
                'shape_img' => $shapePlacement->shape,
            ]
        );

        if ($this->game->shapeMgr->isShapeWithFish($this->game->shapeMgr->getShapeDefIdFromShapeId($shapeId))) {
            $this->game->playerFishCounter->inc($activePlayerId, 1);
            $this->game->tiocNotifyAllPlayers(
                "message",
                clienttranslate('${player_name} gains 1 ${fish_img}'),
                [
                    'player_id' => $activePlayerId,
                    'player_name' => $this->game->loadPlayersBasicInfos()[$activePlayerId]['player_name'],
                    'fish_img' => "",
                ]
            );
        }
        return PlayerTurn::class;
    }
    #[PossibleAction]
    public function actPlayCard(int $card_id, int $activePlayerId, array $args) {
        // check input values
        $playableCardsIds = $args['playableCardsIds'];
        if (!in_array($card_id, $playableCardsIds)) {
            throw new UserException('Invalid card choice');
        }

        // Add your game logic to play a card here.
        $card_name = Game::$CARD_TYPES[$card_id]['card_name'];

        // Notify all players about the card played.
        $this->notify->all("cardPlayed", clienttranslate('${player_name} plays ${card_name}'), [
            "player_id" => $activePlayerId,
            "player_name" => $this->game->getPlayerNameById($activePlayerId), // remove this line if you uncomment notification decorator
            "card_name" => $card_name, // remove this line if you uncomment notification decorator
            "card_id" => $card_id,
            "i18n" => ['card_name'], // remove this line if you uncomment notification decorator
        ]);

        // in this example, the player gains 1 points each time he plays a card
        $this->playerScore->inc($activePlayerId, 1);

        // at the end of the action, move to the next state
        return NextPlayer::class;
    }

    /**
     * Player action, example content.
     *
     * In this scenario, each time a player pass, this method will be called. This method is called directly
     * by the action trigger on the front side with `bgaPerformAction`.
     */
    #[PossibleAction]
    public function actPass(int $activePlayerId) {
        // Notify all players about the choice to pass.
        $this->notify->all("pass", "", [
            //"player_id" => $activePlayerId,
            //"player_name" => $this->game->getPlayerNameById($activePlayerId), // remove this line if you uncomment notification decorator
        ]);
        $anyShapeOnIsland = $this->game->shapeMgr->findByLocation((SHAPE_LOCATION_ID_ISLAND_CAT_SLOT), null);
        if ($anyShapeOnIsland == null && !$this->game->cardMgr->getIslandCards()) {
            $this->notify->all('importantMessage', "", ["message" => clienttranslate('The island is empty, end of the round'), "type" => "POSITIVE", "temporary" => true]);
            return SelectNextRoundCat::class;
        }
        $tookDiscovery = $this->game->getPlayerGlobal($activePlayerId, Constants::GLBL_DISCOVERY_TAKEN);
        if ($tookDiscovery) {
            return NextPlayer::class;
        }
        if ($this->game->getPlayerGlobal($this->game->getOpponentId($activePlayerId), Constants::GLBL_DISCOVERY_TAKEN)) {
            return NextPlayer::class;
        } else {
            $this->notify->all('importantMessage', "", ["message" => clienttranslate('None of you took a discovery from the island, end of the round'), "type" => "POSITIVE", "temporary" => true]);
            return SelectNextRoundCat::class;
        }
    }

    private function actionTypePlaceShape($playerId, $action, $shapeTypeId, $oshaxColorId = null) {
        $mustTouchOtherShapes = true;
        /* if ($this->game->turnActionMgr->canPutNextShapeAnywhere($playerId)) {
            $mustTouchOtherShapes = false;
            $this->game->turnActionMgr->takeNextShapeAnywhere($playerId);
        }*/
        $shapeId = $this->game->value_req($action, 'shapeId');
        $x = $this->game->value_req($action, 'x');
        $y = $this->game->value_req($action, 'y');
        $rotation = $this->game->value_req($action, 'rotation');
        $flipH = $this->game->value_req($action, 'flipH');
        $flipV = $this->game->value_req($action, 'flipV');
        return $this->game->shapeMgr->validateAndPlaceOnBoat(
            $playerId,
            $this->game->getPlayerGlobal($playerId, "boat"),
            $shapeTypeId,
            $shapeId,
            $x,
            $y,
            $rotation,
            $flipH,
            $flipV,
            $mustTouchOtherShapes,
            $oshaxColorId
        );
    }

   /* #[CheckAction(false)]
    function actResetPlayerTurn() {
        $possible = $this->getGlobalVariable(CAN_RESET_TURN);
        if (!$possible) {
            throw new UserException(self::_("Undo is not available"));
        }
        $this->game->undoRestorePoint();
        //$this->toggleResetTurn(false);
        $this->gamestate->reloadState();
    }
**/
    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: play a random card).
     * 
     * See more about Zombie Mode: https://en.doc.boardgamearena.com/Zombie_Mode
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, 
     * but use the $playerId passed in parameter and $this->game->getPlayerNameById($playerId) instead.
     */
    function zombie(int $playerId) {
        // Example of zombie level 0: return NextPlayer::class; or $this->actPass($playerId);

        // Example of zombie level 1:
        $args = $this->getArgs();
        $zombieChoice = $this->getRandomZombieChoice($args['playableCardsIds']); // random choice over possible moves
        return $this->actPlayCard($zombieChoice, $playerId, $args); // this function will return the transition to the next state
    }
}
