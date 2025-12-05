<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

class NextRound extends \Bga\GameFramework\States\GameState {

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 12,
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


        // Go to another gamestate
        $gameEnd = $this->hasReachedEndOfGameRequirements(); // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            return EndScore::class;
        } else {

            $round = $this->globals->inc("round", 1);
            $this->game->resetIsland();

            foreach ($this->game->getPlayers() as $playerId => $player) {
                $this->game->setPlayerGlobal($playerId, Constants::GLBL_DISCOVERY_TAKEN, true);
            }

            if ($round >1) {
                $nextFirstPlayer = $this->game->switchFirstPlayer();
                $this->game->dump('*******************nextFirstPlayer', $nextFirstPlayer);
                $this->game->gamestate->changeActivePlayer($this->game->getOpponentId($nextFirstPlayer));
            } else {
                // $this->game->activeNextPlayer();
            }

            $this->notify->all('newRound', clienttranslate('&#10148; Round ${round}'), ["round" => $round]);
            return NextPlayer::class;
        }
    }

    function hasReachedEndOfGameRequirements(): bool {
        $playersIds = $this->game->getPlayersIds();
        $end = $this->game->shapeMgr->fieldIsEmpty();
        /*if(!$end){
            $this->game->getPlayerGlobal($playerId, GLBL_SELECTION_ACTION_DONE);
        }*/

        return $this->globals->get("round") == 4; //$end;
    }
}
