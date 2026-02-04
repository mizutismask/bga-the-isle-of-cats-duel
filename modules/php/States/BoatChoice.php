<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\Actions\Types\StringParam;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

use const Bga\Games\TheIsleOfCatsDuel\BOAT_RAT_PLACEMENT;

class BoatChoice extends GameState {
    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: Constants::STATE_ID_BOAT_CHOICE,
            type: StateType::ACTIVE_PLAYER,
            description: clienttranslate('${actplayer} must choose a boat'),
            descriptionMyTurn: clienttranslate('${you} must choose a boat'),
        );
    }

    /**
     * Game state arguments, example content.
     *
     * This method returns some additional information that is very specific to the `PlayerTurn` game state.
     */
    public function getArgs(): array {
        // Get some values from the current game situation from the database.

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
    public function actChooseBoat(#[StringParam(enum: ['IBoat', 'OBoat'])] string $boat, int $activePlayerId) {
        $this->game->setPlayerGlobal($activePlayerId, 'boat', $boat);
        $this->notify->all("boatChosen", "", ["playerId" => $activePlayerId, "boatShape" => $boat]);
        $this->game->playerRatsCounter->set($activePlayerId, count(BOAT_RAT_PLACEMENT[$boat]));
        if ($this->game->getPlayerGlobal($this->game->getOpponentId($activePlayerId), 'boat')) {
            $this->game->globals->set(Constants::GLBL_BOATS_CHOSEN, true);
            return NextRound::class;
        }
        return NextBoatChooser::class;
    }

    /**
     * Game state action, example content.
     *
     * The onEnteringState method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    function onEnteringState(int $activePlayerId) {
        $this->game->giveExtraTime($activePlayerId);
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
        return $this->actChooseBoat('OBoat', $playerId);
    }
}
