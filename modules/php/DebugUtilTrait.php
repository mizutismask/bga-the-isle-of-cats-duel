<?php

namespace Bga\Games\TheIsleOfCatsDuel;

trait DebugUtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function debugSetup() {
        if (!$this->isStudio()) {
            return;
        }

        //$this->debugSetDestinationInHand(7, 2343492);
        //$this->gamestate->changeActivePlayer(2343492);
    }

    function debug_setOshaxLocation(int $slotNumber) {
        $this->globals->set(Constants::GLBL_OSHAX_LOCATION, $slotNumber);
    }
    function debug_addFish() {
        $this->playerFishCounter->inc($this->getCurrentPlayerId(), 1);
    }

    /*function cd() {
        $this->debugCompleteDestinations();
    }*/

    /*function debug_CompleteDestinations() {
        $players = $this->getPlayersIds();
        $restriction = " limit " . ($this->getInitialDestinationCardNumber() - 1);
        foreach ($players as $playerId) {
            static::DbQuery("UPDATE `destination` set `completed` = true WHERE `card_location_arg`= $playerId" . $restriction);
        }
        $this->gamestate->jumpToState(ST_PLAYER_CHOOSE_ACTION);
    }*/

    /*function debug_EmptyDestinationDeck() {
        $this->destinations->moveAllCardsInLocation('deck', 'void');
    }*/

    /*function debug_AlmostEmptyDestinationDeck() {
        $moveNumber = $this->getRemainingDestinationCardsInDeck() - 1;
        $this->destinations->pickCardsForLocation($moveNumber, 'deck', 'discard');
    }*/


    /*function debug_clear() {
        static::DbQuery("DELETE FROM `claimed_routes`");
        $this->setGlobalVariable(LAST_BLUE_ROUTES, [null, null, null]);
        $this->setGameStateValue(BLUEPOINT_ACTIONS_REMAINING, 0);
        $this->debugResetArrowsLeft();
        static::DbQuery("UPDATE `destination` set `completed` = false");
    }*/

    function endGame() {
        $this->gamestate->nextState("endGame");
    }
}
