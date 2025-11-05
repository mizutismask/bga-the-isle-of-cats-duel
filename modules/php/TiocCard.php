<?php

namespace Bga\Games\TheIsleOfCatsDuel;

class TiocCard {
    public $cardId;
    public $cardLocationId;
    public $deckOrder;
    public $playerId;
    public $playerPrivate;
    public $cardTypeId;
    public $needsBuyColor;
    public $playedMoveNumber;
    public $islandCardSlot;

    public function __construct(int $cardId, int $cardLocationId, int $deckOrder = 1, ?int $playerId = null,  $playerPrivate = false, ?int $playedMoveNumber = null) {
        $this->cardId = $cardId;
        $this->cardLocationId = $cardLocationId;
        $this->deckOrder = $deckOrder;
        $this->playerId = $playerId;
        $this->playerPrivate = $playerPrivate;
        $this->playedMoveNumber = $playedMoveNumber;
        $this->cardTypeId = null;
        if ($this->cardId >= 67 && $this->cardId <= 97) {
            $this->cardTypeId = CARD_TYPE_ID_ANYTIME;
        } else if ($this->cardId >= 98 && $this->cardId <= 112) {
            $this->cardTypeId = CARD_TYPE_ID_TREASURE;
        } else if ($this->cardId >= 113 && $this->cardId <= 142) {
            $this->cardTypeId = CARD_TYPE_ID_LESSON;
        }
    }

    public function isTreasure() {
        return ($this->cardTypeId == CARD_TYPE_ID_TREASURE);
    }

    public function isLesson() {
        return ($this->cardTypeId == CARD_TYPE_ID_LESSON);
    }

    public function isInDeck() {
        return ($this->cardLocationId == CARD_LOCATION_ID_DECK);
    }

    public function isOnPlayerTable($playerId) {
        return ($this->cardLocationId == CARD_LOCATION_ID_TABLE && !$this->playerPrivate && $this->playerId == $playerId);
    }

    public function isOnTable() {
        return ($this->cardLocationId == CARD_LOCATION_ID_TABLE);
    }

    public function isInPlayerHand($playerId) {
        return ($this->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND && $this->playerId == $playerId);
    }

    public function isInPlayerBuy($playerId) {
        return ($this->cardLocationId == CARD_LOCATION_ID_PLAYER_BUY && $this->playerId == $playerId);
    }

    public function isOnIsland() {
        return ($this->cardLocationId == CARD_LOCATION_ID_ISLAND_CARD_SLOT);
    }

    public function moveToPlayerDraft($playerId) {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_DRAFT;
        $this->playerId = $playerId;
    }

    public function moveToPlayerBuy($playerId) {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_BUY;
        $this->playerId = $playerId;
    }

    public function moveToPlayerHand($playerId, $colorId = null) {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_HAND;
        $this->playerId = $playerId;
    }

    public function moveToTable($playerId) {
        $this->cardLocationId = CARD_LOCATION_ID_TABLE;
        $this->playerId = $playerId;
        $this->playerPrivate = false;
    }

    public function moveToTablePrivate($playerId) {
        $this->cardLocationId = CARD_LOCATION_ID_TABLE;
        $this->playerId = $playerId;
        $this->playerPrivate = true;
    }

    public function moveToDiscard() {
        $this->cardLocationId = CARD_LOCATION_ID_DISCARD;
        $this->playerId = null;
    }

    public function moveToDiscardPlayed($moveNumber) {
        $this->cardLocationId = CARD_LOCATION_ID_DISCARD_PLAYED;
        $this->playedMoveNumber = $moveNumber - 1;
    }

    public function moveToIslandCardSlot($slotNumber) {
        $this->cardLocationId = CARD_LOCATION_ID_ISLAND_CARD_SLOT;
        $this->islandCardSlot = $slotNumber;
    }

    public function isVisibleForPlayerId($playerId, $privateVisible) {
        if ($playerId == $this->playerId || $this->cardLocationId == CARD_LOCATION_ID_DISCARD_PLAYED) {
            return true;
        }
        if ($this->cardLocationId == CARD_LOCATION_ID_TABLE) {
            if ($privateVisible) {
                return true;
            }
            if ($this->cardTypeId == CARD_TYPE_ID_LESSON) {
                return false;
            }
            if ($this->playerPrivate) {
                return false;
            }
            return true;
        }
        return false;
    }
}
