<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

class NextPlayer extends \Bga\GameFramework\States\GameState
{

    function __construct(
        protected Game $game,
    ) {
        parent::__construct($game,
            id: 90,
            type: StateType::GAME,
            updateGameProgression: true,
        );
    }

    /**
     * Game state action, example content.
     *
     * The onEnteringState method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    function onEnteringState() {

        // Give some extra time to the active player when he completed an action
        $activePlayerId = $this->game->activeNextPlayer();
        $this->game->giveExtraTime($activePlayerId);
        
        $this->game->globals->set(Constants::GLBL_REMAINING_OSHAX_MOVES, 2);
        $this->game->globals->set(Constants::GLBL_MANDATORY_MOVE_DONE, false);
        $this->game->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, null);
        $this->game->globals->set(Constants::GLBL_REMAINING_TREASURES, 0);
        $this->game->setPlayerGlobal($activePlayerId, Constants::GLBL_DISCOVERY_TAKEN, false);
        
        $this->game->contextMgr->reset();
        
        // Go to another gamestate
        $gameEnd = false; // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            return EndScore::class;
        } else {
            //$this->game->undoSavepoint();
            return PlayerTurn::class;
        }
    }
}