<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

class EndOfRound extends \Bga\GameFramework\States\GameState {

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: Constants::STATE_ID_END_OF_ROUND,
            type: StateType::GAME
        );
    }

    /**
     * Game state action, example content.
     *
     * The onEnteringState method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    function onEnteringState() {
        // Go to another gamestate
        $gameEnd = $this->hasReachedEndOfGameRequirements(); // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            return EndScore::class;
        } else {
            $nextFirstPlayer = $this->game->switchFirstPlayer();
            $this->game->gamestate->changeActivePlayer($nextFirstPlayer);
            return SelectNextRoundCat::class;
        }
    }

    function hasReachedEndOfGameRequirements(): bool {
        return $this->globals->get("round") == 4; //$end;
    }
}
