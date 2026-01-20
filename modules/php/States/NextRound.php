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
        $round = $this->globals->inc("round", 1);
        $this->game->resetIsland();

        foreach ($this->game->getPlayers() as $playerId => $player) {
            $this->game->setPlayerGlobal($playerId, Constants::GLBL_DISCOVERY_TAKEN, true);
        }

        //switch first player because nextPlayer state will switch it again, and we don’t want the player to be changed if it’s not the first round
        if ($round > 1) {
            $firstPlayer = $this->globals->get("firstPlayer");
            $this->game->gamestate->changeActivePlayer($this->game->getOpponentId($firstPlayer));
        }

        $this->notify->all('newRound', clienttranslate('&#10148; Round ${round}'), ["round" => $round]);
        return NextPlayer::class;
    }
}
