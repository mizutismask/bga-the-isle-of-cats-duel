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

const SHAPE_LOCATION_ID_BAG = 0;
const SHAPE_LOCATION_ID_TABLE = 1;
const SHAPE_LOCATION_ID_FIELD = 2;
const SHAPE_LOCATION_ID_BOAT = 4;
const SHAPE_LOCATION_ID_DISCARD = 5;
const SHAPE_LOCATION_ID_TO_PLACE = 6;
const SHAPE_LOCATION_ID_ISLAND_CAT_SLOT = 7;

class TiocShape {
    public $shapeId;
    public $shapeTypeId;
    public $colorId;
    public $shapeDefId;
    public $shapeLocationId;
    public $bagOrder;
    public $playerId;
    public $boatTopX;
    public $boatTopY;
    public $boatRotation;
    public $boatHorizontalFlip;
    public $boatVerticalFlip;
    public $shapeArray;
    public $width;
    public $height;
    public $playedMoveNumber;
    public $islandCatSlot;

    public function __construct(
        TiocShapeDefMgr $shapeDefMgr,
        int $shapeId,
        int $shapeTypeId,
        ?int $colorId,
        int $shapeDefId,
        int $shapeLocationId,
        ?int $bagOrder = null,
        ?int $playerId = null,
        ?int $boatTopX = null,
        ?int $boatTopY = null,
        ?int $boatRotation = null,
        ?int $boatHorizontalFlip = null,
        ?int $boatVerticalFlip = null,
        ?int $playedMoveNumber = null,
        ?int $islandCatSlot = null,

    ) {
        $this->shapeId = $shapeId;
        $this->shapeTypeId = $shapeTypeId;
        $this->colorId = $colorId;
        $this->shapeDefId = $shapeDefId;
        $this->shapeLocationId = $shapeLocationId;
        $this->bagOrder = $bagOrder;
        $this->playerId = $playerId;
        $this->boatTopX = $boatTopX;
        $this->boatTopY = $boatTopY;
        $this->boatRotation = $boatRotation;
        $this->boatHorizontalFlip = $boatHorizontalFlip;
        $this->boatVerticalFlip = $boatVerticalFlip;
        $this->shapeArray = $shapeDefMgr->shapeFromId($this->shapeDefId)->shapeArray();
        $this->height = count($this->shapeArray);
        $this->width = count($this->shapeArray[0]);
        $this->playedMoveNumber = $playedMoveNumber;
        $this->islandCatSlot = $islandCatSlot;
    }

    public function isCommonTreasure() {
        return ($this->shapeTypeId == SHAPE_TYPE_ID_COMMON_TREASURE);
    }

    public function isCat() {
        return ($this->shapeTypeId == SHAPE_TYPE_ID_CAT);
    }

    public function isInBag() {
        return ($this->shapeLocationId == SHAPE_LOCATION_ID_BAG);
    }
   
    public function isOnTable() {
        return ($this->shapeLocationId == SHAPE_LOCATION_ID_TABLE);
    }

    public function isInField() {
        return ($this->shapeLocationId == SHAPE_LOCATION_ID_FIELD);
    }

    public function isOnIsland() {
        return ($this->shapeLocationId == SHAPE_LOCATION_ID_ISLAND_CAT_SLOT);
    }

    public function isToPlaceLocation() {
        return ($this->shapeLocationId == SHAPE_LOCATION_ID_TO_PLACE);
    }

    public function isOnPlayerBoat($playerId) {
        return ($this->playerId == $playerId && $this->shapeLocationId == SHAPE_LOCATION_ID_BOAT);
    }

    public function isVisible() {
        return ($this->shapeLocationId != SHAPE_LOCATION_ID_BAG && $this->shapeLocationId != SHAPE_LOCATION_ID_DISCARD);
    }

    public function moveToDiscard() {
        $this->shapeLocationId = SHAPE_LOCATION_ID_DISCARD;
        $this->playerId = null;
    }

    public function moveToToPlaceLocation($playedMoveNumber) {
        $this->shapeLocationId = SHAPE_LOCATION_ID_TO_PLACE;
        $this->playedMoveNumber = $playedMoveNumber;
    }

    public function moveToTable() {
        $this->shapeLocationId = SHAPE_LOCATION_ID_TABLE;
    }

    public function moveToField() {
        $this->shapeLocationId = SHAPE_LOCATION_ID_FIELD;
    }

    public function moveToIslandCatSlot($slotNumber) {
        $this->shapeLocationId = SHAPE_LOCATION_ID_ISLAND_CAT_SLOT;
        $this->islandCatSlot = $slotNumber;
    }
   
    public function moveToBoat($playerId, $x, $y, $rotation, $flipH, $flipV, $playedMoveNumber) {
        $this->shapeLocationId = SHAPE_LOCATION_ID_BOAT;
        $this->playerId = $playerId;
        $this->boatTopX = $x;
        $this->boatTopY = $y;
        $this->boatRotation = $rotation;
        $this->boatHorizontalFlip = $flipH;
        $this->boatVerticalFlip = $flipV;
        $this->playedMoveNumber = $playedMoveNumber;
    }
}