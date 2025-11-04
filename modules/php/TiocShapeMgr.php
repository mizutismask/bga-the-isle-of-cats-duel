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

//require_once("TiocGlobals.inc.php");
//require_once("TiocShapeDef.class.php");

const COMMON_TREASURE_PER_PLAYERS = [
    2 => 7,
];


const SHAPE_ROTATIONS = [0, 90, 180, 270];


class TiocShapeMgr {
    private $game = null;
    private $shapes = null;
    private $shapeDefMgr = null;

    public function __construct($game) {
        $this->game = $game;
        $this->shapeDefMgr = new TiocShapeDefMgr();
    }

    public function setup($nbOfPlayers) {
        $this->shapes = [];
        $shapeId = 0;
        foreach (CAT_COLOR_IDS as $catColorId) {
            foreach (TiocShapeDefMgr::CAT_IDS as $shapeDefId) {
                $this->shapes[] = new TiocShape(
                    $this->shapeDefMgr,
                    $shapeId++,
                    SHAPE_TYPE_ID_CAT,
                    $catColorId,
                    $shapeDefId,
                    SHAPE_LOCATION_ID_BAG
                );
            }
        }

        foreach (TiocShapeDefMgr::COMMON_TREASURE_IDS as $shapeDefId) {
            for ($i = 0; $i < COMMON_TREASURE_PER_PLAYERS[$nbOfPlayers]; ++$i) {
                $this->shapes[] = new TiocShape(
                    $this->shapeDefMgr,
                    $shapeId++,
                    SHAPE_TYPE_ID_COMMON_TREASURE,
                    null,
                    $shapeDefId,
                    SHAPE_LOCATION_ID_TABLE
                );
            }
        }
        shuffle($this->shapes);
        $bagOrder = 1;
        foreach ($this->shapes as $shape) {
            if ($shape->shapeLocationId != SHAPE_LOCATION_ID_BAG) {
                continue;
            }
            $shape->bagOrder = $bagOrder;
            if ($bagOrder <= 3) {
                $shape->shapeLocationId = SHAPE_LOCATION_ID_FIELD;
            }
            ++$bagOrder;
        }
        $this->save();
    }

    public function load() {
        if ($this->shapes !== null) {
            return;
        }
        $this->shapes = [];
        $valueArray = $this->game->getObjectListFromDB("SELECT "
            . "shape_id,"
            . "shape_type_id,"
            . "color_id,"
            . "shape_def_id,"
            . "shape_location_id,"
            . "bag_order,"
            . "player_id,"
            . "boat_top_x,"
            . "boat_top_y,"
            . "boat_rotation,"
            . "boat_horizontal_flip,"
            . "boat_vertical_flip,"
            . "played_move_number"
            . " FROM shape");
        foreach ($valueArray as $value) {
            $shape = new TiocShape(
                $this->shapeDefMgr,
                $value['shape_id'],
                $value['shape_type_id'],
                $value['color_id'],
                $value['shape_def_id'],
                $value['shape_location_id'],
                $value['bag_order'],
                $value['player_id'],
                $value['boat_top_x'],
                $value['boat_top_y'],
                $value['boat_rotation'],
                $value['boat_horizontal_flip'],
                $value['boat_vertical_flip'],
                $value['played_move_number'],
            );
            $this->shapes[] = $shape;
        }
        usort($this->shapes, function ($s1, $s2) {
            $bag = $s1->bagOrder <=> $s2->bagOrder;
            if ($bag != 0) return $bag;
            return $s1->shapeId <=> $s2->shapeId;
        });
    }

    public function save() {
        if ($this->shapes === null) {
            return;
        }
        $this->game->DbQuery("DELETE FROM shape");
        $sql = "INSERT INTO shape ("
            . "shape_id,"
            . "shape_type_id,"
            . "color_id,"
            . "shape_def_id,"
            . "shape_location_id,"
            . "bag_order,"
            . "player_id,"
            . "boat_top_x,"
            . "boat_top_y,"
            . "boat_rotation,"
            . "boat_horizontal_flip,"
            . "boat_vertical_flip,"
            . "played_move_number"
            . ") VALUES ";
        $sqlValues = [];
        foreach ($this->shapes as $shape) {
            $sqlValues[] = "("
                . "{$shape->shapeId},"
                . "{$shape->shapeTypeId},"
                . sqlNullOrValue($shape->colorId) . ","
                . "{$shape->shapeDefId},"
                . "{$shape->shapeLocationId},"
                . sqlNullOrValue($shape->bagOrder) . ","
                . sqlNullOrValue($shape->playerId) . ","
                . sqlNullOrValue($shape->boatTopX) . ","
                . sqlNullOrValue($shape->boatTopY) . ","
                . sqlNullOrValue($shape->boatRotation) . ","
                . sqlNullOrValue($shape->boatHorizontalFlip) . ","
                . sqlNullOrValue($shape->boatVerticalFlip) . ","
                . sqlNullOrValue($shape->playedMoveNumber)
                . ")";
        }
        $sql .= implode(',', $sqlValues);
        $this->game->DbQuery($sql);
    }

    public function findByShapeId($shapeId) {
        $this->load();
        foreach ($this->shapes as $shape) {
            if ($shape->shapeId == $shapeId) {
                return $shape;
            }
        }
        return null;
    }

    public function getShapeTypeIdFromShapeId($shapeId) {
        $this->load();
        foreach ($this->shapes as $shape) {
            if ($shape->shapeId == $shapeId) {
                return $shape->shapeTypeId;
            }
        }
        return null;
    }

    public function fieldIsEmpty() {
        $this->load();
        foreach ($this->shapes as $shape) {
            if (
                $shape->shapeLocationId == SHAPE_LOCATION_ID_FIELD
            ) {
                return false;
            }
        }
        return true;
    }

    public function drawFromBag($nbCatsToDraw) {
        $this->load();
        $drawnShapes = [];
        $nbDrawnCats = 0;
        $leftField = true;
        foreach ($this->shapes as $shape) {
            if (!$shape->isInBag()) {
                continue;
            }
            $drawnShapes[] = $shape;
            if ($shape->isCat()) {
                if ($leftField) {
                    $shape->moveToFieldLeft();
                } else {
                    $shape->moveToFieldRight();
                }
                ++$nbDrawnCats;
                if ($nbDrawnCats >= intval($nbCatsToDraw / 2)) {
                    $leftField = false;
                }
                if ($nbDrawnCats == $nbCatsToDraw) {
                    break;
                }
            } else {
                $shape->moveToTable();
            }
        }

        $this->save();
        return $drawnShapes;
    }

    public function drawToToPlaceLocation() {
        $this->load();
        $drawnShape = null;
        foreach ($this->shapes as $shape) {
            if (!$shape->isInBag()) {
                continue;
            }
            $drawnShape = $shape;
            $shape->moveToToPlaceLocation($this->game->getMoveNumber());
            break;
        }
        $this->save();
        return $drawnShape;
    }

    public function getToPlaceShape() {
        $this->load();
        foreach ($this->shapes as $shape) {
            if ($shape->isToPlaceLocation()) {
                return $shape;
            }
        }
        return null;
    }

    public function moveShapeToTable($shapeId) {
        $this->load();
        $shape = $this->findByShapeId($shapeId);
        if ($shape === null)
            throw new BgaVisibleSystemException("BUG! Invalid shapeId $shapeId");
        $shape->moveToTable();
        $this->save();
        return $shape;
    }

    public function moveToPlaceToField($field) {
        $this->load();

        $movedShape = null;
        foreach ($this->shapes as $shape) {
            if (!$shape->isToPlaceLocation()) {
                continue;
            }
            $movedShape = $shape;
            if ($field == FIELD_LEFT) {
                $shape->moveToFieldLeft();
            } else {
                $shape->moveToFieldRight();
            }
            break;
        }

        $this->save();
        return $movedShape;
    }

    public function getShapesAsArray() {
        $this->load();
        $allShapeArray = [];
        foreach ($this->shapes as $shape) {
            $shapeArray = (array)$shape;
            if (!$shape->isVisible()) {
                $shapeArray['bagOrder'] = 0;
            }
            $allShapeArray[] = $shapeArray;
        }
        return $allShapeArray;
    }

    public function emptyTheFields() {
        $discardedShapes = [];
        $this->load();
        foreach ($this->shapes as $shape) {
            if (!$shape->isInFields()) {
                continue;
            }
            $shape->moveToDiscard();
            $discardedShapes[] = $shape;
        }
        $this->save();
        return $discardedShapes;
    }

    public function discardShapeId($shapeId) {
        $this->load();
        $shape = $this->findByShapeId($shapeId);
        if ($shape === null)
            throw new BgaVisibleSystemException("BUG! Invalid shapeId $shapeId");
        $shape->moveToDiscard();
        $this->save();
        return $shape;
    }

    public function validateAndDiscardTreasure($playerId, $shapeId) {
        $this->load();
        $shape = $this->findByShapeId($shapeId);
        if ($shape === null)
            throw new BgaVisibleSystemException("BUG! Invalid shapeId $shapeId");
        if (!$shape->isOnPlayerBoat($playerId))
            throw new BgaVisibleSystemException("BUG! shapeId $shapeId is not on player boat");
        if (!$shape->isCommonTreasure() && !$shape->isRareTreasure())
            throw new BgaVisibleSystemException("BUG! shapeId $shapeId is not a treasure");

        $shape->moveToDiscard();
        $this->save();
        return $shape;
    }

    public function getPlayerRareTreasure($playerId) {
        $this->load();
        return array_values(array_filter($this->shapes, function ($shape) use (&$playerId) {
            return $shape->isRareTreasure() && $shape->isOnPlayerBoat($playerId);
        }));
    }

    public function countOshax($playerId) {
        $this->load();
        return count(array_filter($this->shapes, function ($shape) use (&$playerId) {
            return $shape->isOshax() && $shape->isOnPlayerBoat($playerId);
        }));
    }

    public function countCat($playerId) {
        $this->load();
        return count(array_filter($this->shapes, function ($shape) use (&$playerId) {
            return $shape->isCat() && $shape->isOnPlayerBoat($playerId);
        }));
    }

    public function countRareTreasure($playerId) {
        $this->load();
        return count($this->getPlayerRareTreasure($playerId));
    }

    public function countCommonTreasure($playerId) {
        $this->load();
        return count(array_filter($this->shapes, function ($shape) use (&$playerId) {
            return $shape->isCommonTreasure() && $shape->isOnPlayerBoat($playerId);
        }));
    }

    public function countUniqueColorNoOshax($playerId) {
        $this->load();
        $colorSet = [];
        foreach ($this->shapes as $shape) {
            if (!$shape->isCat() && !$shape->isOshax()) {
                continue;
            }
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $colorSet[$shape->colorId] = true;
        }
        return count($colorSet);
    }

    public function countPerColor($playerId) {
        $this->load();
        $colorCount = [];
        foreach (CAT_COLOR_IDS as $colorId) {
            $colorCount[$colorId] = 0;
        }
        foreach ($this->shapes as $shape) {
            if ($shape->colorId === null) {
                continue;
            }
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $colorCount[$shape->colorId] += 1;
        }
        return $colorCount;
    }

    public function countMostCommonColor($playerId) {
        $this->load();
        return max($this->countPerColor($playerId));
    }

    public function hasCommonTreasureOnTable() {
        $this->load();
        foreach ($this->shapes as $shape) {
            if ($shape->isCommonTreasure() && $shape->isOnTable()) {
                return true;
            }
        }
        return false;
    }

    public function validateAndPlaceOnBoat($playerId, $boatColorName, $shapeTypeId, $shapeId, $x, $y, $rotation, $flipH, $flipV, $mustTouchOtherShapes, $oshaxColorId = null) {
        if ($x < 0 || $y < 0 || array_search($rotation, SHAPE_ROTATIONS) === false || ($flipH != 0 && $flipH != 1) || ($flipV != 0 && $flipV != 1))
            throw new BgaVisibleSystemException("BUG! Invalid transform for shapeId $shapeId");
        if ($oshaxColorId !== null) {
            if ($shapeTypeId != SHAPE_TYPE_ID_OSHAX)
                throw new BgaVisibleSystemException("BUG! shapeId $shapeId is not an oshax and cannot have a colorId");
            if (array_search($oshaxColorId, CAT_COLOR_IDS) === false)
                throw new BgaVisibleSystemException("BUG! oshaxColorId $oshaxColorId is not a valid colorId");
        }

        $this->load();
        $shape = $this->findByShapeId($shapeId);
        if ($shape === null || $shape->shapeTypeId != $shapeTypeId || !$shape->isVisible() || $shape->playerId !== null)
            throw new BgaVisibleSystemException("BUG! Invalid shapeId $shapeId");
        if ($oshaxColorId !== null) {
            $shape->colorId = $oshaxColorId;
        }

        $previousShapeLocationId = $shape->shapeLocationId;

        $matchesMapColor = $this->validateBoatWithNewShape($playerId, $boatColorName, $shape, $x, $y, $rotation, $flipH, $flipV, $mustTouchOtherShapes);
        $shape->moveToBoat($playerId, $x, $y, $rotation, $flipH, $flipV, $this->game->getMoveNumber());

        $this->save();
        return new TiocShapePlacementResult(
            $shape,
            $previousShapeLocationId,
            $matchesMapColor
        );
    }

    public function canPlaceShapeAnywhereOnBoat($playerId, $newShape) {
        $boat = new TiocBoatGrid();
        $boatHasShape = false;
        $this->load();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boatHasShape = true;
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        if (!$boatHasShape) {
            return true;
        }
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                foreach (SHAPE_ROTATIONS as $rotation) {
                    foreach ([false, true] as $flipH) {
                        foreach ([false, true] as $flipV) {
                            if ($boat->couldPlaceShape($newShape->shapeArray, $x, $y, $rotation, $flipH, $flipV)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    public function getBoatUsedGridColor($playerIdArray) {
        $this->load();
        $playerBoat = [];
        foreach ($playerIdArray as $playerId) {
            $playerBoat[$playerId] = new TiocBoatGrid();
        }
        foreach ($this->shapes as $shape) {
            if ($shape->playerId === null || $shape->shapeLocationId != SHAPE_LOCATION_ID_BOAT) {
                continue;
            }
            $playerBoat[$shape->playerId]->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $playerUsedGridColor = [];
        foreach ($playerIdArray as $playerId) {
            $playerUsedGridColor[$playerId] = $playerBoat[$playerId]->getUsedGridColor();
        }
        return $playerUsedGridColor;
    }

    public function getPlayerVisibleRatPositions($playerId, $boatColorName) {
        $positions = [];
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        foreach (BOAT_RAT_PLACEMENT[$boatColorName] as $pos) {
            if ($boat->isGridEmpty($pos['x'], $pos['y'])) {
                $positions[] = new TiocPosition($pos['x'], $pos['y']);
            }
        }
        return $positions;
    }

    public function countColorShapeNotTouchingRats($playerId, $boatColorName) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $colorSet = [];
        foreach (CAT_COLOR_IDS as $colorId) {
            $colorSet[$colorId] = true;
        }
        foreach (BOAT_RAT_PLACEMENT[$boatColorName] as $pos) {
            $x = $pos['x'];
            $y = $pos['y'];
            if (!$boat->isGridEmpty($x, $y)) {
                continue;
            }
            $otherShape = $boat->getShapeAt($x - 1, $y + 0);
            if ($otherShape !== null) {
                unset($colorSet[$otherShape->colorId]);
            }
            $otherShape = $boat->getShapeAt($x + 1, $y + 0);
            if ($otherShape !== null) {
                unset($colorSet[$otherShape->colorId]);
            }
            $otherShape = $boat->getShapeAt($x + 0, $y - 1);
            if ($otherShape !== null) {
                unset($colorSet[$otherShape->colorId]);
            }
            $otherShape = $boat->getShapeAt($x + 0, $y + 1);
            if ($otherShape !== null) {
                unset($colorSet[$otherShape->colorId]);
            }
        }
        return count($colorSet);
    }

    public function countCatAndOshaxNotTouchingTreasure($playerId) {
        $this->load();
        $boat = new TiocBoatGrid();
        $catShapeIds = [];
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
            if ($shape->isCat() || $shape->isOshax()) {
                $catShapeIds[$shape->shapeId] = true;
            }
        }
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                $shape = $boat->getShapeAt($x, $y);
                if ($shape === null) {
                    continue;
                }
                if (!$shape->isCommonTreasure() && !$shape->isRareTreasure()) {
                    continue;
                }
                $otherShape = $boat->getShapeAt($x - 1, $y + 0);
                if ($otherShape !== null) {
                    unset($catShapeIds[$otherShape->shapeId]);
                }
                $otherShape = $boat->getShapeAt($x + 1, $y + 0);
                if ($otherShape !== null) {
                    unset($catShapeIds[$otherShape->shapeId]);
                }
                $otherShape = $boat->getShapeAt($x + 0, $y - 1);
                if ($otherShape !== null) {
                    unset($catShapeIds[$otherShape->shapeId]);
                }
                $otherShape = $boat->getShapeAt($x + 0, $y + 1);
                if ($otherShape !== null) {
                    unset($catShapeIds[$otherShape->shapeId]);
                }
            }
        }
        return count($catShapeIds);
    }

    public function getPlayerEmptyRoomIds($playerId) {
        $emptyRooms = [];
        for ($index = 0; $index <= count(BOAT_ROOMS_RECTANGLE); ++$index) {
            $emptyRooms[$index] = true;
        }
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                if (!$boat->isGridValid($x, $y)) {
                    continue;
                }
                if ($boat->isGridEmpty($x, $y)) {
                    continue;
                }
                // Check each room to mark it as not empty
                $foundRoom = false;
                foreach (BOAT_ROOMS_RECTANGLE as $index => $rect) {
                    if (
                        $x >= $rect['topX'] && $x <= $rect['bottomX']
                        && $y >= $rect['topY'] && $y <= $rect['bottomY']
                    ) {
                        $foundRoom = true;
                        unset($emptyRooms[$index]);
                        break;
                    }
                }
                // If we did not find any room, it's in the remaning irregular room
                if (!$foundRoom) {
                    unset($emptyRooms[count(BOAT_ROOMS_RECTANGLE)]);
                }
            }
        }
        return array_keys($emptyRooms);
    }

    public function getPlayerUnfilledRoomIds($playerId) {
        $unfilledRooms = [];
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                if (!$boat->isGridValid($x, $y)) {
                    continue;
                }
                if (!$boat->isGridEmpty($x, $y)) {
                    continue;
                }
                // Check each room to mark it as not filled
                $foundRoom = false;
                foreach (BOAT_ROOMS_RECTANGLE as $index => $rect) {
                    if (
                        $x >= $rect['topX'] && $x <= $rect['bottomX']
                        && $y >= $rect['topY'] && $y <= $rect['bottomY']
                    ) {
                        $foundRoom = true;
                        $unfilledRooms[$index] = true;
                        break;
                    }
                }
                // If we did not find any room, it's in the remaning irregular room
                if (!$foundRoom) {
                    $unfilledRooms[count(BOAT_ROOMS_RECTANGLE)] = true;
                }
            }
        }
        return array_keys($unfilledRooms);
    }

    public function getPlayerUnfilledRoomPositions($playerId) {
        return array_map(function ($index) {
            if ($index == count(BOAT_ROOMS_RECTANGLE)) {
                return new TiocPosition(intval(BOAT_TILE_WIDTH / 2), intval(BOAT_TILE_HEIGHT / 2));
            } else {
                return new TiocPosition(
                    intval((BOAT_ROOMS_RECTANGLE[$index]['topX'] + BOAT_ROOMS_RECTANGLE[$index]['bottomX']) / 2),
                    intval((BOAT_ROOMS_RECTANGLE[$index]['topY'] + BOAT_ROOMS_RECTANGLE[$index]['bottomY']) / 2)
                );
            }
        }, $this->getPlayerUnfilledRoomIds($playerId));
    }

    public function getColorShapeTouchingEdges($playerId, $colorId) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $shapes = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            $minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[$x]) / 2;
            foreach ([$minY, $minY + BOAT_TILE_HEIGHT_PER_COLUMN[$x] - 1] as $y) {
                $shape = $boat->getShapeAt($x, $y);
                if ($shape !== null && $shape->colorId !== null && $shape->colorId == $colorId) {
                    $shapes[$shape->shapeId] = $shape;
                }
            }
        }
        // First column has a middle row that touches the edge but not the top and the bottom
        $shape = $boat->getShapeAt(0, intdiv(BOAT_TILE_HEIGHT, 2));
        if ($shape !== null && $shape->colorId !== null && $shape->colorId == $colorId) {
            $shapes[$shape->shapeId] = $shape;
        }
        return array_values($shapes);
    }

    public function hasEmptyOnEdge($playerId) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            $minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[$x]) / 2;
            foreach ([$minY, $minY + BOAT_TILE_HEIGHT_PER_COLUMN[$x] - 1] as $y) {
                if ($boat->isGridEmpty($x, $y)) {
                    return true;
                }
            }
        }
        // First column has a middle row that touches the edge but not the top and the bottom
        if ($boat->isGridEmpty(0, intdiv(BOAT_TILE_HEIGHT, 2))) {
            return true;
        }
        return false;
    }

    public function hasEmptyOnMiddleRow($playerId) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $middleY = intval(BOAT_TILE_HEIGHT / 2);
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            if ($boat->isGridEmpty($x, $middleY)) {
                return true;
            }
        }
        return false;
    }

    public function getColorShape($playerId, $colorId) {
        $this->load();
        $shapes = [];
        foreach ($this->shapes as $shape) {
            if ($shape->isOnPlayerBoat($playerId) && $shape->colorId !== null && $shape->colorId == $colorId) {
                $shapes[] = $shapes;
            }
        }
        return $shapes;
    }

    public function countUncoveredMap($playerId, $boatColorName) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $mapCount = 0;
        foreach (BOAT_MAP_PLACEMENT[$boatColorName] as $mapColor => $pos) {
            if ($boat->isGridEmpty($pos['x'], $pos['y'])) {
                ++$mapCount;
            }
        }
        return $mapCount;
    }

    public function countTreasureTouchingColor($playerId, $colorId) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $treasureTouches = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                $shape = $boat->getShapeAt($x, $y);
                if ($shape === null || array_key_exists($shape->shapeId, $treasureTouches)) {
                    continue;
                }
                if (!$shape->isCommonTreasure() && !$shape->isRareTreasure()) {
                    continue;
                }
                if ($this->positionTouchesColor($boat, $x - 1, $y + 0, $colorId)) {
                    $treasureTouches[$shape->shapeId] = true;
                }
                if ($this->positionTouchesColor($boat, $x + 1, $y + 0, $colorId)) {
                    $treasureTouches[$shape->shapeId] = true;
                }
                if ($this->positionTouchesColor($boat, $x + 0, $y - 1, $colorId)) {
                    $treasureTouches[$shape->shapeId] = true;
                }
                if ($this->positionTouchesColor($boat, $x + 0, $y + 1, $colorId)) {
                    $treasureTouches[$shape->shapeId] = true;
                }
            }
        }
        return count($treasureTouches);
    }

    private function positionTouchesColor($boat, $x, $y, $colorId) {
        $shape = $boat->getShapeAt($x, $y);
        if ($shape !== null && $shape->colorId !== null && $shape->colorId == $colorId) {
            return true;
        }
        return false;
    }

    public function getPlayerCatFamilly($playerId) {
        $this->load();
        $boat = new TiocBoatGrid();
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $famillies = [];
        $seenShapeId = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                $shape = $boat->getShapeAt($x, $y);
                if ($shape === null || $shape->colorId === null || array_key_exists($shape->shapeId, $seenShapeId)) {
                    continue;
                }
                $familly = [];
                $this->buildCatFamilly($familly, $seenShapeId, $boat, $x, $y, $shape->colorId);
                if (count($familly) > 0) {
                    $famillies[] = $familly;
                }
            }
        }
        return $famillies;
    }

    private function buildCatFamilly(&$familly, &$seenShapeId, $boat, $x, $y, $colorId) {
        $shape = $boat->getShapeAt($x, $y);
        if ($shape === null || $shape->colorId === null || $shape->colorId != $colorId || array_key_exists($shape->shapeId, $seenShapeId)) {
            return;
        }
        $familly[] = $shape;
        $seenShapeId[$shape->shapeId] = true;
        $shapePositions = $boat->getShapePositions($shape->shapeId);
        foreach ($shapePositions as $pos) {
            $this->buildCatFamilly($familly, $seenShapeId, $boat, $pos->x - 1, $pos->y + 0, $colorId);
            $this->buildCatFamilly($familly, $seenShapeId, $boat, $pos->x + 1, $pos->y + 0, $colorId);
            $this->buildCatFamilly($familly, $seenShapeId, $boat, $pos->x + 0, $pos->y - 1, $colorId);
            $this->buildCatFamilly($familly, $seenShapeId, $boat, $pos->x + 0, $pos->y + 1, $colorId);
        }
    }

    public function debugDistributeShapes($playerIdArray, $playerOrderMgr) {
        $this->load();
        foreach ($this->shapes as $shape) {
            for ($i = 0; $i < 100; ++$i) {
                $foundValidPlace = false;
                $shape->moveToTable();

                $playerId = $playerIdArray[array_rand($playerIdArray)];
                $boatColorName = $playerOrderMgr->getPlayerBoatColorName($playerId);
                $x = random_int(0, BOAT_TILE_WIDTH - 1);
                $minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[$x]) / 2;
                $y = $minY + random_int(0, BOAT_TILE_HEIGHT_PER_COLUMN[$x]);
                $rotation = SHAPE_ROTATIONS[array_rand(SHAPE_ROTATIONS)];
                $flipH = random_int(0, 1);
                $flipV = random_int(0, 1);
                $oshaxColorId = null;
                if ($shape->isOshax()) {
                    $oshaxColorId = CAT_COLOR_IDS[array_rand(CAT_COLOR_IDS)];
                }
                try {
                    $this->validateAndPlaceOnBoat(
                        $playerId,
                        $boatColorName,
                        $shape->shapeTypeId,
                        $shape->shapeId,
                        $x,
                        $y,
                        $rotation,
                        $flipH,
                        $flipV,
                        false,
                        $oshaxColorId
                    );
                    $foundValidPlace = true;
                } catch (BgaVisibleSystemException $e) {
                    $shape->moveToDiscard();
                }
                if ($foundValidPlace) {
                    break;
                }
            }
        }
        $this->save();
    }

    private function validateBoatWithNewShape($playerId, $boatColorName, $newShape, $x, $y, $rotation, $flipH, $flipV, $mustTouchOtherShapes) {
        $boat = new TiocBoatGrid();
        $boatHasShape = false;
        foreach ($this->shapes as $shape) {
            if (!$shape->isOnPlayerBoat($playerId)) {
                continue;
            }
            $boatHasShape = true;
            $boat->addShape($shape, $shape->boatTopX, $shape->boatTopY, $shape->boatRotation, $shape->boatHorizontalFlip, $shape->boatVerticalFlip);
        }
        $boat->validateShape($newShape->shapeId, $newShape->shapeArray, $x, $y, $rotation, $flipH, $flipV, $boatHasShape ? $mustTouchOtherShapes : false);
        // Shapes with no color don't allow to place other shapes when covering map
        if ($newShape->colorId === null) {
            return false;
        }
        return $boat->shapeCoversMapColor($newShape->shapeArray, $x, $y, $rotation, $flipH, $flipV, CAT_COLOR_NAMES[$newShape->colorId], $boatColorName);
    }
}


const BOAT_TILE_WIDTH = 22;
const BOAT_TILE_HEIGHT = 9;
const BOAT_TILE_HEIGHT_PER_COLUMN = [
    3,
    5,
    5,
    5,
    7,
    7,
    7,
    9,
    9,
    9,
    9,
    9,
    9,
    9,
    9,
    7,
    7,
    5,
    5,
    3,
    3,
    1
];
const BOAT_NB_MAP = 5;
const BOAT_MAP_PLACEMENT = [
    'blue' => [
        'blue' => ['x' => 14, 'y' => 1],
        'green' => ['x' => 7, 'y' => 0],
        'red' => ['x' => 1, 'y' => 3],
        'purple' => ['x' => 9, 'y' => 7],
        'orange' => ['x' => 19, 'y' => 5],
    ],
    'green' => [
        'blue' => ['x' => 1, 'y' => 3],
        'green' => ['x' => 14, 'y' => 1],
        'red' => ['x' => 19, 'y' => 5],
        'purple' => ['x' => 7, 'y' => 0],
        'orange' => ['x' => 9, 'y' => 7],
    ],
    'red' => [
        'blue' => ['x' => 9, 'y' => 7],
        'green' => ['x' => 1, 'y' => 3],
        'red' => ['x' => 14, 'y' => 1],
        'purple' => ['x' => 19, 'y' => 5],
        'orange' => ['x' => 7, 'y' => 0],
    ],
    'purple' => [
        'blue' => ['x' => 7, 'y' => 0],
        'green' => ['x' => 19, 'y' => 5],
        'red' => ['x' => 9, 'y' => 7],
        'purple' => ['x' => 1, 'y' => 3],
        'orange' => ['x' => 14, 'y' => 1],
    ],
];
const BOAT_RAT_PLACEMENT = [
    'blue' => [
        ['x' => 0, 'y' => 5],
        ['x' => 1, 'y' => 5],
        ['x' => 1, 'y' => 6],
        ['x' => 4, 'y' => 1],
        ['x' => 7, 'y' => 3],
        ['x' => 8, 'y' => 3],
        ['x' => 10, 'y' => 8],
        ['x' => 11, 'y' => 0],
        ['x' => 12, 'y' => 0],
        ['x' => 13, 'y' => 0],
        ['x' => 13, 'y' => 8],
        ['x' => 14, 'y' => 0],
        ['x' => 14, 'y' => 7],
        ['x' => 14, 'y' => 8],
        ['x' => 15, 'y' => 6],
        ['x' => 15, 'y' => 7],
        ['x' => 17, 'y' => 2],
        ['x' => 18, 'y' => 2],
        ['x' => 19, 'y' => 3],
    ],
    'green' => [
        ['x' => 0, 'y' => 4],
        ['x' => 1, 'y' => 2],
        ['x' => 2, 'y' => 2],
        ['x' => 5, 'y' => 3],
        ['x' => 5, 'y' => 4],
        ['x' => 5, 'y' => 7],
        ['x' => 10, 'y' => 1],
        ['x' => 12, 'y' => 0],
        ['x' => 12, 'y' => 1],
        ['x' => 12, 'y' => 5],
        ['x' => 12, 'y' => 6],
        ['x' => 12, 'y' => 7],
        ['x' => 13, 'y' => 0],
        ['x' => 13, 'y' => 1],
        ['x' => 13, 'y' => 5],
        ['x' => 14, 'y' => 0],
        ['x' => 17, 'y' => 6],
        ['x' => 18, 'y' => 6],
        ['x' => 19, 'y' => 3],
    ],
    'red' => [
        ['x' => 0, 'y' => 3],
        ['x' => 0, 'y' => 4],
        ['x' => 0, 'y' => 5],
        ['x' => 5, 'y' => 5],
        ['x' => 6, 'y' => 2],
        ['x' => 7, 'y' => 2],
        ['x' => 7, 'y' => 8],
        ['x' => 8, 'y' => 8],
        ['x' => 10, 'y' => 3],
        ['x' => 12, 'y' => 2],
        ['x' => 12, 'y' => 3],
        ['x' => 13, 'y' => 2],
        ['x' => 13, 'y' => 3],
        ['x' => 14, 'y' => 7],
        ['x' => 14, 'y' => 8],
        ['x' => 15, 'y' => 7],
        ['x' => 16, 'y' => 7],
        ['x' => 18, 'y' => 3],
        ['x' => 18, 'y' => 4],
    ],
    'purple' => [
        ['x' => 0, 'y' => 3],
        ['x' => 1, 'y' => 2],
        ['x' => 2, 'y' => 2],
        ['x' => 6, 'y' => 3],
        ['x' => 6, 'y' => 6],
        ['x' => 7, 'y' => 6],
        ['x' => 8, 'y' => 0],
        ['x' => 9, 'y' => 0],
        ['x' => 9, 'y' => 3],
        ['x' => 11, 'y' => 7],
        ['x' => 11, 'y' => 8],
        ['x' => 12, 'y' => 4],
        ['x' => 12, 'y' => 8],
        ['x' => 13, 'y' => 4],
        ['x' => 14, 'y' => 4],
        ['x' => 15, 'y' => 1],
        ['x' => 16, 'y' => 1],
        ['x' => 17, 'y' => 6],
        ['x' => 18, 'y' => 6],
    ],
];
const BOAT_ROOMS_ID_PARROT_BACK = 0;
const BOAT_ROOMS_ID_MOON_TOP = 1;
const BOAT_ROOMS_ID_MOON_BOTTOM = 2;
const BOAT_ROOMS_ID_APPLE_MIDDLE = 3;
const BOAT_ROOMS_ID_CORN_FRONT = 4;
const BOAT_ROOMS_ID_PARROT_FRONT = 5;
const BOAT_ROOMS_RECTANGLE = [
    // Back - Parrot
    ['topX' => 0, 'topY' => 1, 'bottomX' => 2, 'bottomY' => 7],
    // Top - Moon
    ['topX' => 3, 'topY' => 0, 'bottomX' => 9, 'bottomY' => 1],
    // Bottom - Moon
    ['topX' => 3, 'topY' => 8, 'bottomX' => 9, 'bottomY' => 8],
    // Middle - Apple
    ['topX' => 5, 'topY' => 3, 'bottomX' => 11, 'bottomY' => 5],
    // Front (large) - Corn
    ['topX' => 16, 'topY' => 1, 'bottomX' => 19, 'bottomY' => 6],
    // Front (small) - Parrot
    ['topX' => 20, 'topY' => 3, 'bottomX' => 21, 'bottomY' => 5],
    // The rest: no icon (and not listed here)
];
