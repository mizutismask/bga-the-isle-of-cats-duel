<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\TheIsleOfCatsDuel\Game;
use const Bga\Games\TheIsleOfCatsDuel\NTF_DISCARD_SHAPES;
use const Bga\Games\TheIsleOfCatsDuel\SHAPE_LOCATION_ID_FIELD;

class SelectNextRoundCat extends GameState {
    
    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 14,
            type: StateType::ACTIVE_PLAYER,
            description: clienttranslate('${actplayer} must select which cat to put back in the game'),
            descriptionMyTurn: clienttranslate('You must select which cat from under the island to put back in the game'),
        );
    }

    function onEnteringState(int $activePlayerId, array $args) {
       /* $shape = $this->game->shapeMgr->findByLocation(SHAPE_LOCATION_ID_FIELD, null);
        if (!$shape) return NextRound::class;*/

        $this->game->giveExtraTime($activePlayerId);
    }
    /**
     * Game state arguments, example content.
     *
     * This method returns some additional information that is very specific to the `PlayerTurn` game state.
     */
    public function getArgs(): array {
        return [];
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
    public function actPutCatBack(int $shapeId, int $activePlayerId, array $args) {
        // check input values
        $shape = $this->game->shapeMgr->findByShapeId($shapeId);
        if (!$shape || $shape->shapeLocationId != SHAPE_LOCATION_ID_FIELD) {
            throw new UserException('You can not put this cat back');
        }

        return $this->moveShapeToBag($activePlayerId, $shape);
    }

    private function moveShapeToBag($playerId, $shape) {
        $this->game->shapeMgr->moveShapeToBag($shape->shapeId);
        $this->game->tiocNotifyAllPlayers(
            NTF_DISCARD_SHAPES,
            clienttranslate('${player_name} puts the drawn shape back in the game ${shapes_img}'),
            [
                'shapes' => [$shape],
                'shapes_img' => [$shape],
                'player_name' => $this->game->getPlayerName($playerId),
            ]
        );
        return NextRound::class;
    }

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
        $args = $this->getArgs();
        $shape = $this->game->shapeMgr->findByLocation(SHAPE_LOCATION_ID_FIELD, null);
        return $this->moveShapeToBag($playerId, $shape);
    }
}
