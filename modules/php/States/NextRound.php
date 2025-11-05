<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
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
    function onEnteringState(int $activePlayerId) {


        // Go to another gamestate
        $gameEnd = $this->hasReachedEndOfGameRequirements($activePlayerId); // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            return EndScore::class;
        } else {

            $round = $this->globals->inc("round", 1);
            $this->game->giveExtraTime($activePlayerId);
            $this->game->shapeMgr->emptyIsland();
            $this->game->shapeMgr->drawFromBag(10);
            $this->game->cardMgr->emptyIsland();
            $this->game->cardMgr->drawCardsForIsland(5);

            if ($round > 0) {
                $nextFirstPlayer = $this->game->switchFirstPlayer();
                $this->game->gamestate->changeActivePlayer($nextFirstPlayer);
            } else {
                $this->game->activeNextPlayer();
            }

            $this->notify->all('newRound', clienttranslate('&#10148; Round ${round}'), ["round" => $round]);
            return PlayerTurn::class;
        }
    }

    function hasReachedEndOfGameRequirements($playerId): bool {
        $playersIds = $this->game->getPlayersIds();
        $end = $this->game->shapeMgr->fieldIsEmpty();
        /*if(!$end){
            $this->game->getPlayerGlobal($playerId, GLBL_SELECTION_ACTION_DONE);
        }*/

        return $end;
    }
}
