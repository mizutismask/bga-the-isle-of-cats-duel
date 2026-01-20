<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\StateType;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

class NextBoatChooser extends \Bga\GameFramework\States\GameState {

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: Constants::STATE_ID_NEXT_BOAT_CHOOSER,
            type: StateType::GAME,
        );
    }


    function onEnteringState() {
        $this->game->activeNextPlayer();
        return BoatChoice::class;
    }
}
