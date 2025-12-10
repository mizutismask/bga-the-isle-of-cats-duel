<?php

namespace Bga\Games\TheIsleOfCatsDuel;

use Bga\Games\TheIsleOfCatsDuel\Constants;

class IslandMgr {

    const GLBL_OSHAX_LOCATION = 'oshaxLocation';

    public function __construct(private Game $game) {
    }

    public function isValidSlot(int $slotNumber) {
        return $slotNumber > 0 && $slotNumber <= 15;
    }

    public function getOshaxPossibleMoves() {
        $oshax = $this->game->globals->get(Constants::GLBL_OSHAX_LOCATION);
        $this->game->dump('*****************oshax**', $oshax);
        return match ($oshax) {
            1 =>  [2, 6],
            2 =>  [1, 3, 6, 7, 8],
            3 =>  [2, 4, 8],
            4 =>  [3, 5, 8, 9, 10],
            5 =>  [4, 10],
            6 =>  [1, 2, 7, 11],
            7 =>  [2, 6, 8, 12],
            8 =>  [2, 3, 4, 7, 9, 13],
            9 =>  [4, 8, 10, 13, 14, 15],
            10 =>  [4, 5, 9, 15],
            11 =>  [6, 7, 12],
            12 =>  [7, 11, 13],
            13 =>  [7, 8, 9, 12, 14],
            14 =>  [9, 13, 15],
            15 =>  [9, 10, 14],
        };
    }

    public function getOshaxValidMoves() {
        $fishAction = $this->game->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        $remainingMoves = $this->game->globals->get(Constants::GLBL_REMAINING_OSHAX_MOVES);
        if ($fishAction == "J") {
            $possibleMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        } else if ($remainingMoves) {
            $possibleMoves = $this->getOshaxPossibleMoves();
        } else {
            $possibleMoves = [];
        }

        $previousMoves = $this->game->contextMgr->getAllContextLogs(Constants::CONTEXT_ACTION_OSHAX_MOVE);
        $slotsSeen = array_unique(array_merge(...array_map(function ($move) {
            return [$move['param1'], $move['param2']];
        }, $previousMoves)));

        return array_values(array_diff($possibleMoves, $slotsSeen));
    }

    public function moveOshaxToSlot(int $playerId, int $slot) {
        $this->game->contextMgr->insertContextLog(Constants::CONTEXT_ACTION_OSHAX_MOVE, $this->game->globals->get(Constants::GLBL_OSHAX_LOCATION), $slot);
        $this->game->globals->set(Constants::GLBL_OSHAX_LOCATION, $slot);

        $remainingMoves = $this->game->globals->inc(Constants::GLBL_REMAINING_OSHAX_MOVES, -1);
        if ($remainingMoves == 0) $this->game->globals->set(Constants::GLBL_MANDATORY_MOVE_DONE, true);

        $this->game->notify->all("oshaxMove", "", [
            "player_id" => $playerId,
            "to" => $slot,
        ]);
    }

    public function getPossibleSlotsForDiscovery() {
        $slotsSeen = [];
        if ($this->game->globals->get(Constants::GLBL_MANDATORY_MOVE_DONE)) {
            $previousMoves = $this->game->contextMgr->getAllContextLogs(Constants::CONTEXT_ACTION_OSHAX_MOVE);
            $slotsSeen = array_unique(array_merge(...array_map(function ($move) {
                return [$move['param1'], $move['param2']];
            }, $previousMoves)));
        }
        return  $slotsSeen;
    }
}
