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
class TiocBoatGridColor {
    public $x;
    public $y;
    public $colorId;
    public $shapeId;

    public function __construct($x, $y, $colorId, $shapeId) {
        $this->x = $x;
        $this->y = $y;
        $this->colorId = $colorId;
        $this->shapeId = $shapeId;
    }
}