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
const CARD_NORMAL_RANGE_END = 150;
const CARD_FAMILY_RANGE_START = 151;
const CARD_FAMILY_RANGE_END = 168;

const CARD_LOCATION_ID_DECK = 0;
const CARD_LOCATION_ID_PLAYER_DRAFT = 1;
const CARD_LOCATION_ID_PLAYER_BUY = 2;
const CARD_LOCATION_ID_PLAYER_HAND = 3;
const CARD_LOCATION_ID_TABLE = 4;
const CARD_LOCATION_ID_DISCARD = 5;
const CARD_LOCATION_ID_DISCARD_PLAYED = 6;

const CARD_TYPE_ID_OSHAX = 0;
const CARD_TYPE_ID_RESCUE = 1;
const CARD_TYPE_ID_ANYTIME = 2;
const CARD_TYPE_ID_TREASURE = 3;
const CARD_TYPE_ID_PRIVATE_LESSON = 4;
const CARD_TYPE_ID_PUBLIC_LESSON = 5;

const SOME_CARD_PRICE_PER_ID = [
    67 => 2,
    68 => 2,
    69 => 1,
    70 => 1,
    71 => 0,
    72 => 0,
    73 => 1,
    74 => 1,
    75 => 3,
    76 => 2,
    77 => 1,
    78 => 2,
    79 => 2,
    80 => 2,
    81 => 2,
    82 => 2,
    83 => 1,
    84 => 6,
    85 => 6,
    86 => 2,
    87 => 2,
    88 => 3,
    89 => 3,
    90 => 2,
    91 => 2,
    92 => 2,
    93 => 2,
    94 => 2,
    95 => 2,
    96 => 2,
    97 => 2,
];

const CARD_NEEDS_BUY_COLOR = [
    143 => true,
    144 => true,
    145 => true,
    146 => true,
    149 => true,
];

const CARD_BASKET_TYPE_ID_HALF = 0;
const CARD_BASKET_TYPE_ID_FULL = 1;

const CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON = 0;
const CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON = 1;

const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX = 0;
const CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE = 1;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2 = 2;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3 = 3;
const CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE = 4;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET = 5;
const CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS = 6;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS = 7;
const CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS = 8;
const CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE = 9;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET = 10;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON = 11;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE = 12;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR = 13;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE = 14;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE = 15;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR = 16;

// Cards that can only be played as a unique action (no undo) since they reveal new information
const CARD_ANYTIME_SERVER_SIDE_IDS = [
    CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2,
    CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3,
    CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE,
    CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE,
];
// Cards that can be played in the buy phase
const CARD_ANYTIME_BUY_PHASE_IDS = [
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR,
];


class TiocCardMgr
{
    private $game = null;
    private $cards = null;

    public function __construct($game)
    {
        $this->game = $game;
    }

    public function setup()
    {
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

    public function load()
    {
        if ($this->cards !== null) {
            return $this->cards;
        }
        $this->cards = [];
        $valueArray = $this->game->getObjectListFromDB("SELECT card_id, card_location_id, deck_order, player_id, color_id, player_private, played_move_number FROM card");
        foreach ($valueArray as $value) {
            $card = new TiocCard(
                $value['card_id'],
                $value['card_location_id'],
                $value['deck_order'],
                $value['player_id'],
                $value['color_id'],
                $value['player_private'] == 1,
                $value['played_move_number']
            );
            $this->cards[] = $card;
        }
        usort($this->cards, function ($c1, $c2) {
            return $c1->deckOrder <=> $c2->deckOrder;
        });
        return $this->cards;
    }

    public function save()
    {
        if ($this->cards === null) {
            return;
        }
        $this->game->DbQuery("DELETE FROM card");
        $sql = "INSERT INTO card (card_id, card_location_id, deck_order, player_id, color_id, player_private, played_move_number) VALUES ";
        $sqlValues = [];
        foreach ($this->cards as $card) {
            $playerPrivate = $card->playerPrivate ? 1 : 0;
            $sqlValues[] = "({$card->cardId}, {$card->cardLocationId}, {$card->deckOrder}, " . sqlNullOrValue($card->playerId) . ", " . sqlNullOrValue($card->colorId) . ", {$playerPrivate}, " . sqlNullOrValue($card->playedMoveNumber) . ")";
        }
        $sql .= implode(',', $sqlValues);
        $this->game->DbQuery($sql);
    }

    public function findByCardId($cardId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardId == $cardId) {
                return $card;
            }
        }
        return null;
    }

    public function isCardIdAnytime($cardId)
    {
        $card = $this->findByCardId($cardId);
        if ($card === null) {
            return false;
        }
        return ($card->cardTypeId == CARD_TYPE_ID_ANYTIME);
    }

    public function drawCardsForDraft($playerId, $nbCardToDraw)
    {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck()) {
                continue;
            }
            $card->moveToPlayerDraft($playerId);
            $drawnCards[] = $card;
            if (count($drawnCards) >= $nbCardToDraw) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function drawCardsForBuy($playerId, $nbCardToDraw)
    {
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

    public function getVisibleCardsForPlayerId($playerId, $privateVisible)
    {
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

    public function getPrivateLessonsCount($playerIdArray)
    {
        $this->load();
        $privateLessonsCount = [];
        foreach ($playerIdArray as $playerId) {
            $privateLessonsCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
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

    public function getPublicLessonCards()
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->cardTypeId == CARD_TYPE_ID_PUBLIC_LESSON) {
                $cards[] = $card;
            }
        }
        return $cards;
    }
    public function getPrivateLessonCards($playerId)
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->playerId === null || $card->playerId != $playerId) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }

    public function getHandCardCount($playerIdArray)
    {
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
    
    public function getTableRescueCardsCardCount($playerIdArray)
    {
        $this->load();
        $cardCount = [];
        foreach ($playerIdArray as $playerId) {
            $cardCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->playerId === null) {
                continue;
            }
            if ($card->cardLocationId == CARD_LOCATION_ID_TABLE && $card->cardTypeId == CARD_TYPE_ID_RESCUE) {
                $cardCount[$card->playerId] += 1;
            }
        }
        return $cardCount;
    }

    public function moveDraftCardsToBuy($playerId, $cardIds)
    {
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

    public function draftKeepOnlyCardList($playerId, $cardIds)
    {
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

    public function draftDiscardAll($playerId)
    {
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

    public function moveFamilyDraftCardsToHand()
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT && $card->playerId !== null) {
                $card->moveToPlayerHand($card->playerId);
            }
        }

        $this->save();
    }

    public function moveRecueCardFromHandToTablePrivate($playerId, $cardIds)
    {
        $rescueCards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if (count($cardIds) == 0) {
                break;
            }
            $i = array_search($card->cardId, $cardIds);
            if ($i === false) {
                continue;
            }
            if (
                $card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND
                || $card->cardTypeId != CARD_TYPE_ID_RESCUE
                || $card->playerId != $playerId
            ) {
                return null;
            }
            array_splice($cardIds, $i, 1);
            $card->moveToTablePrivate($playerId);
            $rescueCards[] = $card;
        }
        if (count($cardIds) > 0) {
            return null;
        }
        $this->save();
        return $rescueCards;
    }

    public function passDraftCardsToNextPlayer($nextPlayerIds)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT) {
                $card->playerId = $nextPlayerIds[$card->playerId];
            }
        }
        $this->save();
    }

    public function getPlayerDraftCards($playerId)
    {
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

    public function playerCountCardsToBuy($playerId)
    {
        $count = 0;
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                ++$count;
            }
        }
        return $count;
    }

    public function playerHasCardsToBuy($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                return true;
            }
        }
        return false;
    }

    public function buyPlayerCard($playerId, $cardId, $colorId)
    {
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
        return $card->price;
    }

    public function movePublicLessonsToTable()
    {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PUBLIC_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            $card->moveToTable(null);
            $cards[] = $card;
        }
        $this->save();
        return $cards;
    }

    public function movePrivateLessonsToTable($playerId)
    {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
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

    public function getPlayerIdWithRecueCardsInHand()
    {
        $playerIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_RESCUE) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            if ($card->playerId === null) {
                continue;
            }
            $playerIds[$card->playerId] = true;
        }
        return array_keys($playerIds);
    }

    public function reavealTablePrivateCardsPerPlayerId()
    {
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

    public function validateAndUseRescueCards($playerId, $firstCardId, $secondCardId)
    {
        $returnCards = [];
        $this->load();
        $firstCard = $this->findByCardId($firstCardId);
        if ($firstCard === null || !$firstCard->isOnPlayerTable($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid firstCardId $firstCardId");

        if ($firstCard->isRescueFullBasket() && $secondCardId === null) {
            $firstCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $returnCards[] = $firstCard;
        } else if ($firstCard->isRescueHalfBasket() && $secondCardId !== null) {
            $secondCard = $this->findByCardId($secondCardId);
            if ($secondCard === null || !$secondCard->isOnPlayerTable($playerId) || !$secondCard->isRescueHalfBasket())
                throw new BgaVisibleSystemException("BUG! Invalid secondCardId $secondCardId");
            $firstCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $secondCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $returnCards[] = $firstCard;
            $returnCards[] = $secondCard;
        } else {
            throw new BgaVisibleSystemException("BUG! Invalid first and second card");
        }

        $this->save();
        return $returnCards;
    }

    public function validateAndUseTreasureCard($playerId, $cardId)
    {
        $this->load();
        $playedCard = $this->findByCardId($cardId);
        if ($playedCard === null || !$playedCard->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$playedCard->isTreasure())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a treasure");

        $playedCard->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $playedCard;
    }

    public function validateAndUseOshaxCard($playerId, $cardId)
    {
        $this->load();
        $playedCard = $this->findByCardId($cardId);
        if ($playedCard === null || !$playedCard->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$playedCard->isOshax())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not an oshax");

        $playedCard->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $playedCard;
    }

    public function discardUnusedRecueCards()
    {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_TABLE && $card->playerId !== null && $card->cardTypeId == CARD_TYPE_ID_RESCUE) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function discardUnbuyCards($playerId)
    {
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

    public function validatePlayAnytimeServerSideCard($cardId, $playerId)
    {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isCardAnytimeServerSide)
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a server side card");

        if (!$card->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not in player hand");

        $card->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $card;
    }

    public function validatePlayAnytimeClientSideCard($cardId, $playerId, $allowedAnytimeTypeIdArray = null)
    {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! cardId $cardId dot not exists");
        if ($card->cardAnytimeTypeId === null)
            throw new BgaVisibleSystemException("BUG! cardId $cardId has no anytime type id");
        if ($allowedAnytimeTypeIdArray !== null && array_search($card->cardAnytimeTypeId, $allowedAnytimeTypeIdArray) === false)
            throw new BgaVisibleSystemException("BUG! cardId $cardId has cardAnytimeTypeId which is not allowed");
        if ($card->isCardAnytimeServerSide)
            throw new BgaVisibleSystemException("BUG! cardId $cardId is a server side card");

        if (!$card->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not in player hand");

        $card->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $card;
    }

    public function validateAndDiscardPrivateLesson($playerId, $cardId)
    {

        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isPrivateLesson())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a private lesson");
        if (!$card->isOnPlayerTable($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not on player table");

        $card->moveToDiscard();

        $this->save();
        return $card;
    }

    public function hasNoCardsInHand()
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND) {
                return false;
            }
        }
        return true;
    }

    public function playerHasNoCardsInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                return false;
            }
        }
        return true;
    }

    public function getPlayerHandCardIdArray($playerId)
    {
        $cardIdArray = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                $cardIdArray[] = $card->cardId;
            }
        }
        return $cardIdArray;
    }

    public function countRescueBasket($playerId)
    {
        $this->load();
        $count = 0;
        foreach ($this->cards as $card) {
            if ($card->isOnPlayerTable($playerId)) {
                if ($card->isRescueFullBasket()) {
                    $count += 1;
                } else if ($card->isRescueHalfBasket()) {
                    $count += 0.5;
                }
            }
        }
        return $count;
    }

    public function countTreasureCards($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->isTreasure() && $card->isInPlayerHand($playerId);
        }));
    }

    public function countOshaxCards($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->isOshax() && $card->isInPlayerHand($playerId);
        }));
    }

    public function playerHasAnytimeCardsInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId == CARD_TYPE_ID_ANYTIME && $card->isInPlayerHand($playerId)) {
                return true;
            }
        }
        return false;
    }

    public function playerHasAnytimeCardsForRescuePhaseInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_ANYTIME || !$card->isInPlayerHand($playerId)) {
                continue;
            }
            switch ($card->cardAnytimeTypeId) {
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE:
                    return true;
            }
        }
        return false;
    }

    public function playerHasAnytimeCardsForRareFindsPhaseInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_ANYTIME || !$card->isInPlayerHand($playerId)) {
                continue;
            }
            switch ($card->cardAnytimeTypeId) {
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                    return true;
            }
        }
        return false;
    }

    public function playerAnytimeCardIdSet($playerId)
    {
        $this->load();
        $cardIdSet = [];
        foreach ($this->cards as $card) {
            if ($card->cardTypeId == CARD_TYPE_ID_ANYTIME && $card->isInPlayerHand($playerId)) {
                $cardIdSet[$card->cardId] = true;
            }
        }
        return $cardIdSet;
    }

    public function countPrivateLessons($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON && $card->isOnPlayerTable($playerId);
        }));
    }

    public function debugDistributeCards($playerIdArray)
    {
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
        $this->movePublicLessonsToTable();
        foreach ($playerIdArray as $playerId) {
            $this->movePrivateLessonsToTable($playerId);
        }
    }
}
