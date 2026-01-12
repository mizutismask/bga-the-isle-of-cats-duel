<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

namespace Bga\Games\TheIsleOfCatsDuel;

use BgaVisibleSystemException;

const CARD_NORMAL_RANGE_START = 1;
const CARD_NORMAL_RANGE_END = 32;

const CARD_LOCATION_ID_DECK = 0;
const CARD_LOCATION_ID_PLAYER_DRAFT = 1;
const CARD_LOCATION_ID_PLAYER_BUY = 2;
const CARD_LOCATION_ID_PLAYER_HAND = 3;
const CARD_LOCATION_ID_TABLE = 4;
const CARD_LOCATION_ID_DISCARD = 5;
const CARD_LOCATION_ID_DISCARD_PLAYED = 6;
const CARD_LOCATION_ID_ISLAND_CARD_SLOT = 7;
const CARD_LOCATION_ID_ISLAND_CAT_SLOT = 7;

const CARD_NEEDS_BUY_COLOR = [
    143 => true,
    144 => true,
    145 => true,
    146 => true,
    149 => true,
];

/*const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX = 0;
const CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE = 1;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2 = 2;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3 = 3;*/
const CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE = 4;
//const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET = 5;
//const CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS = 6;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_UNIQUE_CATS = 7;
//const CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS = 8;
//const CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE = 9;
//const CARD_ANYTIME_TYPE_ID_GAIN_BASKET = 10;
//const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON = 11;
//const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE = 12;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_MAX_COLOR = 13;
//const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE = 14;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE = 15;
//const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR = 16;

class TiocCardMgr {
    private $game = null;
    /**@var TiocCard[] */
    private $cards = null;

    public function __construct($game) {
        $this->game = $game;
    }

    public function setup() {
        $this->cards = [];
        $cardIdRange = range(CARD_NORMAL_RANGE_START, CARD_NORMAL_RANGE_END);

        foreach ($cardIdRange as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_DECK
            );
            $this->cards[] = $card;
        }
        shuffle($this->cards);

        $deckOrder = 1;
        foreach ($this->cards as $card) {
            $card->deckOrder = $deckOrder;
            ++$deckOrder;
        }
        $this->save();
    }

    public function load() {
        if ($this->cards !== null) {
            return $this->cards;
        }
        $this->cards = [];
        $valueArray = $this->game->getObjectListFromDB("SELECT card_id, card_location_id, deck_order, player_id, player_private, island_card_slot, played_move_number FROM card");
        foreach ($valueArray as $value) {
            $card = new TiocCard(
                $value['card_id'],
                $value['card_location_id'],
                $value['deck_order'],
                $value['player_id'],
                $value['player_private'] == 1,
                $value['island_card_slot'],
                $value['played_move_number']
            );
            $this->cards[] = $card;
        }
        usort($this->cards, function ($c1, $c2) {
            return $c1->deckOrder <=> $c2->deckOrder;
        });
        return $this->cards;
    }

    public function save() {
        if ($this->cards === null) {
            return;
        }
        $this->game->DbQuery("DELETE FROM card");
        $sql = "INSERT INTO card (card_id, card_location_id, deck_order, player_private, player_id, island_card_slot, played_move_number) VALUES ";
        $sqlValues = [];
        foreach ($this->cards as $card) {
            $playerPrivate = $card->playerPrivate ? 1 : 0;
            $sqlValues[] = "({$card->cardId}, {$card->cardLocationId}, {$card->deckOrder}, {$playerPrivate}, " . sqlNullOrValue($card->playerId)  . ", " . sqlNullOrValue($card->islandCardSlot)  . ", " . sqlNullOrValue($card->playedMoveNumber) . ")";
        }
        $sql .= implode(',', $sqlValues);
        $this->game->DbQuery($sql);
    }

    public function findByCardId($cardId) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardId == $cardId) {
                return $card;
            }
        }
        return null;
    }
    public function findByCardLocation($locationId, $cardSlot) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == $locationId && $card->islandCardSlot == $cardSlot) {
                return $card;
            }
        }
        return null;
    }

    public function drawCardsForIsland($nbCardToDraw) {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck()) {
                continue;
            }
            $card->moveToIslandCardSlot(count($drawnCards) + 1);
            $drawnCards[] = $card;
            $this->game->dump('*******************', $card->cardLocationId);
            if (count($drawnCards) >= $nbCardToDraw) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function drawCardsForBuy($playerId, $nbCardToDraw) {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck()) {
                continue;
            }
            $card->moveToPlayerBuy($playerId);
            $drawnCards[] = $card;
            if (count($drawnCards) >= $nbCardToDraw) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function getVisibleCardsForPlayerId($playerId, $privateVisible) {
        $this->load();
        $visibleCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isVisibleForPlayerId($playerId, $privateVisible)) {
                continue;
            }
            $visibleCards[] = $card;
        }
        return $visibleCards;
    }

    public function getLessonsCount($playerIdArray) {
        $this->load();
        $privateLessonsCount = [];
        foreach ($playerIdArray as $playerId) {
            $privateLessonsCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != Constants::CARD_TYPE_ID_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->playerId === null) {
                continue;
            }
            $privateLessonsCount[$card->playerId] += 1;
        }
        return $privateLessonsCount;
    }

    public function getLessonCards($playerId) {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != Constants::CARD_TYPE_ID_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            if ($card->playerId === null || $card->playerId != $playerId) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }
    public function getIslandCards() {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {

            if ($card->cardLocationId != CARD_LOCATION_ID_ISLAND_CARD_SLOT) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }

    public function getHandCardCount($playerIdArray) {
        $this->load();
        $cardCount = [];
        foreach ($playerIdArray as $playerId) {
            $cardCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->playerId === null) {
                continue;
            }
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND) {
                $cardCount[$card->playerId] += 1;
            }
        }
        return $cardCount;
    }

    public function moveDraftCardsToBuy($playerId, $cardIds) {
        $this->load();
        foreach ($this->cards as $card) {
            if (count($cardIds) == 0) {
                break;
            }
            $i = array_search($card->cardId, $cardIds);
            if ($i === false) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                return false;
            }
            array_splice($cardIds, $i, 1);
            $card->moveToPlayerBuy($playerId);
        }
        if (count($cardIds) > 0) {
            return false;
        }
        $this->save();
        return true;
    }

    public function draftKeepOnlyCardList($playerId, $cardIds) {
        $this->load();
        $discardCardId = null;
        $keepCardCount = 0;
        foreach ($this->cards as $card) {
            $i = array_search($card->cardId, $cardIds);
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                if ($i !== false) {
                    return null;
                }
                continue;
            }
            if ($i === false) {
                if ($discardCardId !== null) {
                    return null;
                } else {
                    $discardCardId = $card->cardId;
                    $card->moveToDiscard();
                }
            } else {
                ++$keepCardCount;
            }
        }
        if ($discardCardId === null || count($cardIds) != $keepCardCount) {
            return null;
        }
        $this->save();
        return $discardCardId;
    }

    public function draftDiscardAll($playerId) {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT && $card->playerId == $playerId) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function moveLessonToHand($cardId, $playerId) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardId == $cardId) {
                $card->moveToPlayerHand($playerId);
            }
        }

        $this->save();
    }

    public function passDraftCardsToNextPlayer($nextPlayerIds) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT) {
                $card->playerId = $nextPlayerIds[$card->playerId];
            }
        }
        $this->save();
    }

    public function getPlayerDraftCards($playerId) {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }

    public function playerCountCardsToBuy($playerId) {
        $count = 0;
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                ++$count;
            }
        }
        return $count;
    }

    public function playerHasCardsToBuy($playerId) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                return true;
            }
        }
        return false;
    }

    public function buyPlayerCard($playerId, $cardId, $colorId) {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null || !$card->isInPlayerBuy($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if ($colorId === null && $card->needsBuyColor)
            throw new BgaVisibleSystemException("BUG! cardId $cardId needs buy color");

        if ($colorId !== null && !$card->needsBuyColor)
            throw new BgaVisibleSystemException("BUG! cardId $cardId does not need buy color");

        if ($colorId !== null && array_search($colorId, CAT_COLOR_IDS) === false)
            throw new BgaVisibleSystemException("BUG! colorId $colorId is not valid");

        $card->moveToPlayerHand($playerId, $colorId);

        $this->save();
        return 0;
    }

    public function moveLessonsToTable($playerId) {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != Constants::CARD_TYPE_ID_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            if ($card->playerId != $playerId) {
                continue;
            }
            $card->moveToTable($playerId);
            $cards[] = $card;
        }
        $this->save();
        return $cards;
    }

    public function reavealTablePrivateCardsPerPlayerId() {
        $playedCards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if (
                $card->cardLocationId != CARD_LOCATION_ID_TABLE
                || $card->playerId === null
                || !$card->playerPrivate
            ) {
                continue;
            }
            $card->moveToTable($card->playerId);
            if (!array_key_exists($card->playerId, $playedCards)) {
                $playedCards[$card->playerId] = [];
            }
            $playedCards[$card->playerId][] = $card;
        }
        $this->save();
        return $playedCards;
    }

    public function validateAndUseTreasureCard($playerId, $cardId) {
        $this->load();
        $playedCard = $this->findByCardId($cardId);
        if ($playedCard === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$playedCard->isTreasure())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a treasure");

        $playedCard->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();

        $this->game->notify->all("materialMove", '', [
            'type' => Constants::MATERIAL_TYPE_CARD,
            'from' => Constants::MATERIAL_LOCATION_ISLAND,
            'to' => Constants::MATERIAL_LOCATION_DISCARD,
            'material' => [$playedCard],
            'notifSender' => __METHOD__,
        ]);

        return $playedCard;
    }

    public function validatePlayAnytimeCard($cardId, $playerId) {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isOnIsland($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not on the island");

        $card->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        $this->game->notify->all("materialMove", '', [
            'type' => Constants::MATERIAL_TYPE_CARD,
            'from' => Constants::MATERIAL_LOCATION_ISLAND,
            'to' => Constants::MATERIAL_LOCATION_DISCARD,
            'material' => [$card],
            'notifSender' => __METHOD__,
        ]);

        return $card;
    }

    public function discardUnbuyCards($playerId) {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function emptyIsland() {
        $discardedCards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if (!$card->isOnIsland()) {
                continue;
            }
            $card->moveToDiscard();
            $discardedCards[] = $card;
        }
        $this->save();
        return $discardedCards;
    }

    public function validateAndDiscardLesson($playerId, $cardId) {

        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isLesson())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a lesson");
        if (!$card->isOnPlayerTable($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not on player table");

        $card->moveToDiscard();

        $this->save();
        return $card;
    }

    public function hasNoCardsInHand() {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND) {
                return false;
            }
        }
        return true;
    }

    public function playerHasNoCardsInHand($playerId) {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                return false;
            }
        }
        return true;
    }

    public function getPlayerHandCardIdArray($playerId) {
        $cardIdArray = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                $cardIdArray[] = $card->cardId;
            }
        }
        return $cardIdArray;
    }

    public function countTreasureCards($playerId) {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->isTreasure() && $card->isInPlayerHand($playerId);
        }));
    }

    public function countLessons($playerId) {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->cardTypeId == Constants::CARD_TYPE_ID_LESSON && $card->isOnPlayerTable($playerId);
        }));
    }

    public function debugDistributeCards($playerIdArray) {
        $this->load();
        foreach ($this->cards as $card) {
            switch ($card->cardTypeId) {
                default:
                    $colorId = null;
                    if ($card->needsBuyColor) {
                        $colorId = CAT_COLOR_IDS[array_rand(CAT_COLOR_IDS)];
                    }
                    $playerId = $playerIdArray[array_rand($playerIdArray)];
                    $card->moveToPlayerHand($playerId, $colorId);
                    break;
            }
        }
        $this->save();
        foreach ($playerIdArray as $playerId) {
            $this->moveLessonsToTable($playerId);
        }
    }
}
