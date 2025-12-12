<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;
use BgaVisibleSystemException;

use const Bga\Games\TheIsleOfCatsDuel\O_BOAT_TILE_HEIGHT;
use const Bga\Games\TheIsleOfCatsDuel\O_BOAT_TILE_WIDTH;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_ID_BLUE;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_ID_GREEN;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_ID_ORANGE;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_ID_PURPLE;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_ID_RED;
use const Bga\Games\TheIsleOfCatsDuel\CAT_COLOR_IDS;
use const Bga\Games\TheIsleOfCatsDuel\NB_BOAT_ROOMS_TOTAL;
use const Bga\Games\TheIsleOfCatsDuel\NTF_CREATE_OR_MOVE_CARDS;
use const Bga\Games\TheIsleOfCatsDuel\NTF_SCORE_BOAT_POSITION;
use const Bga\Games\TheIsleOfCatsDuel\NTF_SCORE_CARDS;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SCORE_CAT_FAMILLY;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SCORE_PRIVATE_LESSONS;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SCORE_RATS;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SCORE_UNFILLED_ROOMS;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SIZE_CAT_FAMILLY_1;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SIZE_CAT_FAMILLY_2;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SIZE_CAT_FAMILLY_3;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SIZE_CAT_FAMILLY_4;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_SIZE_CAT_FAMILLY_5;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_TOTAL_COMMON_TREASURE;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_TOTAL_END_CATS;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_TOTAL_END_FISH;
use const Bga\Games\TheIsleOfCatsDuel\STATS_PLAYER_TOTAL_SCORE;

const ST_END_GAME = 99;

const SCORE_GAIN_PER_RARE_TREASURE = 3;
const SCORE_LOSE_PER_RATS = 1;
const SCORE_LOSE_PER_UNFILLED_ROOMS = 5;
const SCORE_SOLO_COLOR = 5;

class TiocScoreBoatPosition {
    public $x;
    public $y;
    public $score;

    public function __construct($x, $y, $score) {
        $this->x = $x;
        $this->y = $y;
        $this->score = $score;
    }
}

class TiocScoreCard {
    public $cardId;
    public $score;

    public function __construct($cardId, $score) {
        $this->cardId = $cardId;
        $this->score = $score;
    }
}

class EndScore extends \Bga\GameFramework\States\GameState {

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 98,
            type: StateType::GAME,
        );
    }

    /**
     * Game state action, example content.
     *
     * The onEnteringState method of state `EndScore` is called just before the end of the game.
     */
    public function onEnteringState() {
        // Here, we would compute scores if they are not updated live, and compute average statistics
        $this->stEndGameScoring();

        if ($this->game->isStudio()) {
            $this->game->stMakeEveryoneActive();
            //$this->game->gamestate->setAllPlayersMultiactive();
            return DebugGameEnd::class;
        } else {
            return ST_END_GAME;
        }
    }

    public function stEndGameScoring() {
        $this->scoreRats();
        $this->scoreUnfilledRooms();
        $this->scoreCatFamilly();
        $this->scorePrivateLessons();

        $this->scoreTieBreaker();


        $playerScoreColumn = 'player_score';
        $sql = "SELECT player_id, score_rats, score_unfilled_rooms, score_cat_familly, score_lessons, $playerScoreColumn score_total FROM player";
        foreach ($this->game->getObjectListFromDB($sql) as $values) {
            $playerId = intval($values['player_id']);

            $this->game->playerStats->set(STATS_PLAYER_TOTAL_SCORE, $values['score_total'] * 1, $playerId);
            $this->game->playerStats->set(STATS_PLAYER_SCORE_RATS, -1 * $values['score_rats'] * 1, $playerId);
            $this->game->playerStats->set(STATS_PLAYER_SCORE_UNFILLED_ROOMS, -1 * $values['score_unfilled_rooms'], $playerId);
            $this->game->playerStats->set(STATS_PLAYER_SCORE_CAT_FAMILLY, $values['score_cat_familly'] * 1, $playerId);
            $this->game->playerStats->set(STATS_PLAYER_SCORE_PRIVATE_LESSONS, $values['score_lessons'] * 1, $playerId);
            $this->game->playerStats->set(STATS_PLAYER_TOTAL_END_FISH, $this->game->playerFishCounter->get($playerId), $playerId);
            $this->game->playerStats->set(STATS_PLAYER_TOTAL_END_CATS, $this->game->shapeMgr->countCat($playerId), $playerId);
            $this->game->playerStats->set(STATS_PLAYER_TOTAL_COMMON_TREASURE, $this->game->shapeMgr->countCommonTreasure($playerId), $playerId);



            $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);

            usort($famillies, fn($a, $b) => count($b) <=> count($a));

            if (count($famillies) > 0 && count($famillies[0]) >= 3) {
                $this->game->playerStats->set(STATS_PLAYER_SIZE_CAT_FAMILLY_1, count($famillies[0]), $playerId);
            }
            if (count($famillies) > 1 && count($famillies[1]) >= 3) {
                $this->game->playerStats->set(STATS_PLAYER_SIZE_CAT_FAMILLY_2, count($famillies[1]), $playerId);
            }
            if (count($famillies) > 2 && count($famillies[2]) >= 3) {
                $this->game->playerStats->set(STATS_PLAYER_SIZE_CAT_FAMILLY_3, count($famillies[2]), $playerId);
            }
            if (count($famillies) > 3 && count($famillies[3]) >= 3) {
                $this->game->playerStats->set(STATS_PLAYER_SIZE_CAT_FAMILLY_4, count($famillies[3]), $playerId);
            }
            if (count($famillies) > 4 && count($famillies[4]) >= 3) {
                $this->game->playerStats->set(STATS_PLAYER_SIZE_CAT_FAMILLY_5, count($famillies[4]), $playerId);
            }
        }
    }

    private function scoreTieBreaker() {
        // Tie breaker: Having the most fish
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $this->game->playerScoreAux->set($playerId, $this->game->playerFishCounter->get($playerId), new NotificationMessage(""));
        }
    }

    private function scorePrivateLessons() {
        $retScoreCards = [];
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $cards = $this->game->cardMgr->getLessonCards($playerId);
            $this->game->tiocNotifyAllPlayers(
                NTF_CREATE_OR_MOVE_CARDS,
                '',
                [
                    'player_id' => $playerId,
                    'player_name' => $playerInfo['player_name'],
                    'cards' => $cards,
                ]
            );
            $allCardsScore = 0;
            $scoreCards = [];
            foreach ($cards as $card) {
                $score = $this->getPrivateLessonCardScore($playerId, $card);
                $allCardsScore += $score;
                $scoreCard = new TiocScoreCard($card->cardId, $score);
                $this->saveCardEndScore($card->cardId, $playerId, $score);
                $scoreCards[] = $scoreCard;
                $retScoreCards[] = $scoreCard;
            }
            $totalScore = $this->addToPlayerScore($playerId, 'score_lessons', $allCardsScore);
            $this->notifyScoreCards(
                clienttranslate('${player_name} scores ${score} points with their lessons ${cardDetail}'),
                $playerId,
                $allCardsScore,
                $totalScore,
                $scoreCards,
                'score_lessons'
            );
        }
        return $retScoreCards;
    }

    private function getPrivateLessonCardScore($playerId, $card) {
        $score = 0;
        switch ($card->cardId) {
            case 11:
                if (!$this->game->shapeMgr->hasEmptyOnEdge($playerId)) {
                    $score = 12;
                }
                break;
            case 12:
                $colorCount = $this->game->shapeMgr->countPerColor($playerId);
                if (count($colorCount) == count(array_filter($colorCount, function ($c) {
                    return $c >= 3;
                }))) {
                    $score = 15;
                }
                break;
            case 13:
                $allColors = true;
                foreach (CAT_COLOR_IDS as $colorId) {
                    if (count($this->game->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId)) == 0) {
                        $allColors = false;
                        break;
                    }
                }
                if ($allColors) {
                    $score = 7;
                }
                break;
            case 14:
                $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if (count($familly) == 1) {
                        $score += 2;
                    }
                }
                break;
            case 15:
                $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);
                $largestFamilySize = 0;
                foreach ($famillies as $familly) {
                    if (count($familly) > $largestFamilySize) {
                        $largestFamilySize = count($familly);
                    }
                }
                $largestFamilyFound = false;
                foreach ($this->game->loadPlayersBasicInfos() as $otherPlayerId => $otherPlayerInfo) {
                    if ($otherPlayerId != $playerId) {
                        $otherPlayerFamillies = $this->game->shapeMgr->getPlayerCatFamilly($otherPlayerId);
                        foreach ($otherPlayerFamillies as $otherPlayerFamilly) {
                            if (count($otherPlayerFamilly) >= $largestFamilySize) {
                                $largestFamilyFound = true;
                                break 2;
                            }
                        }
                    }
                }
                if ($largestFamilyFound) {
                    $score += 7;
                }
                break;
            case 16:
                $score = $this->game->shapeMgr->countCommonTreasure($playerId);
                break;
            case 17:
                $shapes = $this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_BLUE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 18:
                $shapes = $this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_GREEN);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 19:
                $shapes = $this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_PURPLE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 20:
                $shapes = $this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_RED);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 21:
                $shapes = $this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_ORANGE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 22:
                $playerBoatShape = $this->game->getPlayerGlobal($playerId, "boat");
                $positions = $this->game->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerBoatShape);
                if (count($positions) == 5) {
                    $score = 12;
                }
                break;
            case 23:
                if ($this->game->shapeMgr->countCommonTreasure($playerId) == 5) {
                    $score = 9;
                }
                break;
            case 24:
                $catCount = 0;
                foreach (CAT_COLOR_IDS as $colorId) {
                    $catCount += count($this->game->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId));
                }
                $score = intval($catCount / 2);
                break;
            case 25:
                $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);
                if (count($famillies) >= 3) {
                    usort($famillies, function ($familly1, $familly2) {
                        return (count($familly2) <=> count($familly1));
                    });
                    $score = $this->getFamillySizeScore(count($famillies[2]));
                }
                break;
            case 26:
                $maxTreasureCount = 0;
                foreach ($this->game->getPlayers() as $pId => $player) {
                    $treasureCount = $this->game->shapeMgr->countCommonTreasure($pId);
                    $maxTreasureCount = max($maxTreasureCount, $treasureCount);
                }
                if ($this->game->shapeMgr->countCommonTreasure($playerId) == $maxTreasureCount) {
                    $score = 7;
                }
                break;
            case 27:
                $playerBoatShape = $this->game->getPlayerGlobal($playerId, "boat");
                if ($this->game->shapeMgr->countUncoveredMap($playerId, $playerBoatShape) == 2) {
                    $score = 12;
                }
                break;
            case 28:
                if ($this->game->shapeMgr->countCat($playerId) == 18) {
                    $score = 12;
                }
                break;
            case 29:
                // TODO test
                $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);
                $famillySizes = array_map(function ($familly) {
                    return count($familly);
                }, $famillies);
                $famillySizeCounts = array_count_values($famillySizes);
                if (isset($famillySizeCounts[2]) && $famillySizeCounts[2] == 2) {
                    $score = 8;
                }
                break;
            case 30:
                $color1 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_RED));
                $color2 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_BLUE));
                $score = min($color1, $color2) * 2;
                break;
            case 31:
                $color1 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_ORANGE));
                $color2 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_GREEN));
                $score = min($color1, $color2) * 2;
                break;
            case 32:
                $color1 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_PURPLE));
                $color2 = count($this->game->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_BLUE));
                $score = min($color1, $color2) * 2;
                break;
            default:
                throw new BgaVisibleSystemException("BUG! Invalid cardId {$card->cardId}");
        }
        return $score;
    }
    private function scoreRats() {
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $playerBoatShape = $this->game->getPlayerGlobal($playerId, "boat");
            $positions = $this->game->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerBoatShape);
            $score = count($positions) * SCORE_LOSE_PER_RATS;
            $totalScore = $this->substractFromPlayerScore($playerId, 'score_rats', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} loses ${score} points with their visible rats on their boats'),
                $playerId,
                $score,
                $totalScore,
                array_map(function ($pos) {
                    return new TiocScoreBoatPosition($pos->x, $pos->y, -1 * SCORE_LOSE_PER_RATS);
                }, $positions),
                'score_rats'
            );
        }
    }

    private function scoreUnfilledRooms() {
        $nbFilledRoomsPerPlayerId = [];
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $roomsPositions = $this->game->shapeMgr->getPlayerUnfilledRoomPositions($playerId);
            $score = count($roomsPositions) * SCORE_LOSE_PER_UNFILLED_ROOMS;
            $nbFilledRoomsPerPlayerId[$playerId] = NB_BOAT_ROOMS_TOTAL - count($roomsPositions);
            $totalScore = $this->substractFromPlayerScore($playerId, 'score_unfilled_rooms', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} loses ${score} points with their unfilled rooms'),
                $playerId,
                $score,
                $totalScore,
                array_map(function ($pos) {
                    return new TiocScoreBoatPosition($pos->x, $pos->y, -1 * SCORE_LOSE_PER_UNFILLED_ROOMS);
                }, $roomsPositions),
                'score_unfilled_rooms'
            );
        }
        return $nbFilledRoomsPerPlayerId;
    }

    private function scoreCatFamilly() {
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $famillies = $this->game->shapeMgr->getPlayerCatFamilly($playerId);
            $score = 0;
            $scorePosition = [];
            foreach ($famillies as $familly) {
                $famillyScore = $this->getFamillySizeScore(count($familly));
                if ($famillyScore > 0) {
                    $scorePosition[] = $this->averagePositionScore($familly, $famillyScore);
                    $score += $famillyScore;
                }
            }
            $totalScore = $this->addToPlayerScore($playerId, 'score_cat_familly', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} scores ${score} points with their cat famillies ${detail}'),
                $playerId,
                $score,
                $totalScore,
                $scorePosition,
                'score_cat_familly',
                true
            );
        }
    }

    private function averagePositionScore($shapes, $score) {
        $x = 0;
        $y = 0;
        foreach ($shapes as $shape) {
            $x += ($shape->boatTopX + $shape->boatTopX + $shape->width) / 2;
            $y += ($shape->boatTopY + $shape->boatTopY + $shape->height) / 2;
        }
        $x /= count($shapes);
        $y /= count($shapes);
        if ($x >= O_BOAT_TILE_WIDTH) {
            $x = O_BOAT_TILE_WIDTH - 1;
        }
        if ($y >= O_BOAT_TILE_HEIGHT) {
            $y = O_BOAT_TILE_HEIGHT - 1;
        }
        return new TiocScoreBoatPosition(intval($x), intval($y), $score);
    }

    private function getFamillySizeScore($famillyCount) {
        if ($famillyCount < 3) {
            return 0;
        }
        if ($famillyCount == 3) {
            return 8;
        }
        if ($famillyCount == 4) {
            return 11;
        }
        return 5 * ($famillyCount - 2);
    }

    private function notifyScoreCards($msg, $playerId, $score, $totalScore, $scoreCards, $scoreColumn, $moreArgs = []) {
        usort($scoreCards, function ($sc1, $sc2) {
            return ($sc1->cardId <=> $sc2->cardId);
        });
        $cardDetail = implode(", ", array_map(function ($sc) {
            return "{$sc->cardId}: {$sc->score}";
        }, array_filter($scoreCards, function ($sc) {
            return $sc->score > 0;
        })));
        if (strlen($cardDetail) > 0) {
            $cardDetail = "($cardDetail)";
        }
        $playerName = $this->game->loadPlayersBasicInfos()[$playerId]['player_name'];
        $this->game->tiocNotifyAllPlayers(
            NTF_SCORE_CARDS,
            $msg,
            array_merge([
                'player_id' => $playerId,
                'player_name' => $playerName,
                'score' => $score,
                'totalScore' => $totalScore,
                'scoreCards' => $scoreCards,
                'cardDetail' => $cardDetail,
                'scoreColumn' => $scoreColumn,
            ], $moreArgs)
        );
    }

    private function notifyScoreBoatPosition($msg, $playerId, $score, $totalScore, $scoreBoatPosition, $scoreColumn, $showDetail = false) {
        $detail = '';
        if ($showDetail && count($scoreBoatPosition) > 1) {
            usort($scoreBoatPosition, function ($sbp1, $sbp2) {
                return ($sbp1->score <=> $sbp2->score);
            });
            $detail = implode(", ", array_map(function ($sbp) {
                return "{$sbp->score}";
            }, array_filter($scoreBoatPosition, function ($sbp) {
                return $sbp->score > 0;
            })));
            if (strlen($detail) > 0) {
                $detail = "($detail)";
            }
        }
        $this->game->tiocNotifyAllPlayers(
            NTF_SCORE_BOAT_POSITION,
            $msg,
            [
                'player_id' => $playerId,
                'player_name' => $this->game->loadPlayersBasicInfos()[$playerId]['player_name'],
                'score' => $score,
                'totalScore' => $totalScore,
                'scoreBoatPosition' => $scoreBoatPosition,
                'detail' => $detail,
                'scoreColumn' => $scoreColumn,
            ]
        );
    }

    private function addToPlayerScore($playerId, $scoreColumn, $score) {
        $this->game->DbQuery("UPDATE player SET player_score = player_score + $score, $scoreColumn = $score WHERE player_id = $playerId");
        return $this->game->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = $playerId");
    }

    private function substractFromPlayerScore($playerId, $scoreColumn, $score) {
        $this->game->DbQuery("UPDATE player SET player_score = player_score - $score, $scoreColumn = $score WHERE player_id = $playerId");
        return $this->game->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = $playerId");
    }

    private function saveCardEndScore($cardId, $playerId, $score) {
        $this->game->DbQuery("INSERT INTO card_end_score (card_id, player_id, score) VALUES ($cardId, $playerId, $score)");
    }
}
