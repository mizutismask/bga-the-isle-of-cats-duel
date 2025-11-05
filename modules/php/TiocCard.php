<?php

namespace Bga\Games\TheIsleOfCatsDuel;

class TiocCard {
    public $cardId;
    public $cardLocationId;
    public $deckOrder;
    public $playerId;
    public $colorId;
    public $playerPrivate;
    public $cardTypeId;
    public $price;
    public $needsBuyColor;
    public $speed;
    public $cardBasketTypeId;
    public $cardTreasureTypeId;
    public $cardAnytimeTypeId;
    public $isCardAnytimeServerSide;
    public $isCardAnytimeBuyPhase;
    public $playedMoveNumber;

    public function __construct(int $cardId, int $cardLocationId, int $deckOrder = 1, ?int $playerId = null, ?int $colorId = null, $playerPrivate = false, ?int $playedMoveNumber = null) {
        $this->cardId = $cardId;
        $this->cardLocationId = $cardLocationId;
        $this->deckOrder = $deckOrder;
        $this->playerId = $playerId;
        $this->colorId = $colorId;
        $this->colorId = $colorId;
        $this->playerPrivate = $playerPrivate;
        $this->playedMoveNumber = $playedMoveNumber;
        $this->cardTypeId = null;
        if ($this->cardId >= 1 && $this->cardId <= 6) {
            $this->cardTypeId = CARD_TYPE_ID_OSHAX;
        } else if ($this->cardId >= 7 && $this->cardId <= 66) {
            $this->cardTypeId = CARD_TYPE_ID_RESCUE;
        } else if ($this->cardId >= 67 && $this->cardId <= 97) {
            $this->cardTypeId = CARD_TYPE_ID_ANYTIME;
        } else if ($this->cardId >= 98 && $this->cardId <= 112) {
            $this->cardTypeId = CARD_TYPE_ID_TREASURE;
        } else if ($this->cardId >= 113 && $this->cardId <= 142) {
            $this->cardTypeId = CARD_TYPE_ID_PRIVATE_LESSON;
        } else if ($this->cardId >= 143 && $this->cardId <= 150) {
            $this->cardTypeId = CARD_TYPE_ID_PUBLIC_LESSON;
        } else if ($this->cardId >= CARD_FAMILY_RANGE_START && $this->cardId <= CARD_FAMILY_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_PRIVATE_LESSON;
        }

        $this->price = null;
        if ($this->cardId >= 1 && $this->cardId <= 6) {
            $this->price = 5;
        } else if ($this->cardId >= 7 && $this->cardId <= 14) {
            $this->price = 1;
        } else if ($this->cardId >= 15 && $this->cardId <= 22) {
            $this->price = 0;
        } else if ($this->cardId >= 23 && $this->cardId <= 34) {
            $this->price = 1;
        } else if ($this->cardId >= 35 && $this->cardId <= 54) {
            $this->price = 2;
        } else if ($this->cardId >= 55 && $this->cardId <= 66) {
            $this->price = 3;
        } else if ($this->cardId >= 67 && $this->cardId <= 97) {
            $this->price = SOME_CARD_PRICE_PER_ID[$this->cardId];
        } else if ($this->cardId >= 98 && $this->cardId <= 106) {
            $this->price = 2;
        } else if ($this->cardId >= 107 && $this->cardId <= 112) {
            $this->price = 1;
        } else if ($this->cardId >= 113 && $this->cardId <= 142) {
            $this->price = 2;
        } else if ($this->cardId >= 143 && $this->cardId <= 150) {
            $this->price = 1;
        }
        $this->needsBuyColor = array_key_exists($this->cardId, CARD_NEEDS_BUY_COLOR);
        $this->speed = null;
        if ($this->cardId >= 7 && $this->cardId <= 14) {
            $this->speed = 4;
        } else if ($this->cardId >= 15 && $this->cardId <= 22) {
            $this->speed = 0;
        } else if ($this->cardId >= 23 && $this->cardId <= 34) {
            $this->speed = 1;
        } else if ($this->cardId >= 35 && $this->cardId <= 42) {
            $this->speed = 3;
        } else if ($this->cardId >= 43 && $this->cardId <= 54) {
            $this->speed = 1;
        } else if ($this->cardId >= 55 && $this->cardId <= 66) {
            $this->speed = 3;
        }
        $this->cardBasketTypeId = null;
        if ($this->cardId >= 15 && $this->cardId <= 42) {
            $this->cardBasketTypeId = CARD_BASKET_TYPE_ID_HALF;
        } else if ($this->cardId >= 43 && $this->cardId <= 66) {
            $this->cardBasketTypeId = CARD_BASKET_TYPE_ID_FULL;
        }
        $this->cardTreasureTypeId = null;
        if ($this->cardId >= 98 && $this->cardId <= 106) {
            $this->cardTreasureTypeId = CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON;
        } else if ($this->cardId >= 107 && $this->cardId <= 112) {
            $this->cardTreasureTypeId = CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON;
        }
        $this->cardAnytimeTypeId = null;
        if ($this->cardId >= 67 && $this->cardId <= 68) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX;
        } else if ($this->cardId >= 69 && $this->cardId <= 70) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE;
        } else if ($this->cardId >= 71 && $this->cardId <= 72) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2;
        } else if ($this->cardId >= 73 && $this->cardId <= 74) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3;
        } else if ($this->cardId == 75) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE;
        } else if ($this->cardId == 76) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET;
        } else if ($this->cardId == 77) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS;
        } else if ($this->cardId >= 78 && $this->cardId <= 79) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS;
        } else if ($this->cardId >= 80 && $this->cardId <= 82) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS;
        } else if ($this->cardId == 83) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE;
        } else if ($this->cardId >= 84 && $this->cardId <= 85) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET;
        } else if ($this->cardId >= 86 && $this->cardId <= 87) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON;
        } else if ($this->cardId >= 88 && $this->cardId <= 89) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE;
        } else if ($this->cardId >= 90 && $this->cardId <= 91) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR;
        } else if ($this->cardId >= 92 && $this->cardId <= 93) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE;
        } else if ($this->cardId >= 94 && $this->cardId <= 95) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE;
        } else if ($this->cardId >= 96 && $this->cardId <= 97) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR;
        }
        $this->isCardAnytimeServerSide = (array_search($this->cardAnytimeTypeId, CARD_ANYTIME_SERVER_SIDE_IDS) !== false);
        $this->isCardAnytimeBuyPhase = (array_search($this->cardAnytimeTypeId, CARD_ANYTIME_BUY_PHASE_IDS) !== false);
    }

    public function isTreasure() {
        return ($this->cardTypeId == CARD_TYPE_ID_TREASURE);
    }

    public function isOshax() {
        return ($this->cardTypeId == CARD_TYPE_ID_OSHAX);
    }

    public function isPrivateLesson() {
        return ($this->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON);
    }

    public function isRescueFullBasket() {
        return ($this->cardTypeId == CARD_TYPE_ID_RESCUE && $this->cardBasketTypeId !== null && $this->cardBasketTypeId == CARD_BASKET_TYPE_ID_FULL);
    }

    public function isRescueHalfBasket() {
        return ($this->cardTypeId == CARD_TYPE_ID_RESCUE && $this->cardBasketTypeId !== null && $this->cardBasketTypeId == CARD_BASKET_TYPE_ID_HALF);
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
        $this->colorId = $colorId;
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

    public function isVisibleForPlayerId($playerId, $privateVisible) {
        if ($playerId == $this->playerId || $this->cardLocationId == CARD_LOCATION_ID_DISCARD_PLAYED) {
            return true;
        }
        if ($this->cardLocationId == CARD_LOCATION_ID_TABLE) {
            if ($privateVisible) {
                return true;
            }
            if ($this->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON) {
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
