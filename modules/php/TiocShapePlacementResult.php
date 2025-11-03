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

class TiocShapePlacementResult {
    public $shape;
    public $previousShapeLocationId;
    public $matchesMapColor;

    public function __construct(TiocShape $shape, int $previousShapeLocationId, bool $matchesMapColor) {
        $this->shape = $shape;
        $this->previousShapeLocationId = $previousShapeLocationId;
        $this->matchesMapColor = $matchesMapColor;
    }
}
