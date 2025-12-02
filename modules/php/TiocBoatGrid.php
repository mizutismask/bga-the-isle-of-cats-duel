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
class TiocBoatGrid {
    private $boatGridUsed;

    public function __construct() {
        $this->boatGridUsed = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            $this->boatGridUsed[$x] = [];
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                $this->boatGridUsed[$x][$y] = null;
            }
        }
    }

    public function getUsedGridColor() {
        $gridColors = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                if ($this->boatGridUsed[$x][$y] !== null) {
                    $gridColors[] = new TiocBoatGridColor($x, $y, $this->boatGridUsed[$x][$y]->colorId, $this->boatGridUsed[$x][$y]->shapeId);
                }
            }
        }
        return $gridColors;
    }

    public function addShape($shape, $x, $y, $rotation, $paramFlipH, $paramFlipV) {
        $this->forEachShapeGrid($shape->shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV, function ($gridX, $gridY) use (&$shape) {
            $this->boatGridUsed[$gridX][$gridY] = $shape;
        });
    }

    public function validateShape($shapeId, $shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV, $mustTouchOtherShapes) {
        $touchesOtherShapes = false;
        $this->forEachShapeGrid($shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV, function ($gridX, $gridY) use (&$touchesOtherShapes) {
            if (!$this->isGridValidAndEmpty($gridX, $gridY))
                throw new BgaVisibleSystemException("BUG! Invalid grid position");
            if (
                !$this->isGridEmpty($gridX - 1, $gridY) ||
                !$this->isGridEmpty($gridX + 1, $gridY) ||
                !$this->isGridEmpty($gridX, $gridY - 1) ||
                !$this->isGridEmpty($gridX, $gridY + 1)
            ) {
                $touchesOtherShapes = true;
            }
        });
        if ($mustTouchOtherShapes && !$touchesOtherShapes)
            throw new BgaVisibleSystemException("BUG! Shape $shapeId does not touch other shapes");
    }

    public function couldPlaceShape($shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV) {
        $foundValidPlace = true;
        $this->forEachShapeGrid($shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV, function ($gridX, $gridY) use (&$foundValidPlace) {
            if (!$this->isGridValidAndEmpty($gridX, $gridY)) {
                $foundValidPlace = false;
                return false;
            }
        });
        return $foundValidPlace;
    }

    public function shapeCoversMapColor($shapeArray, $x, $y, $rotation, $flipH, $flipV, $shapeColorName, $boatShape) {
        $matchesColor = false;
        $mapPosition = BOAT_MAP_PLACEMENT[$boatShape][$shapeColorName];
        $mapX = $mapPosition['x'];
        $mapY = $mapPosition['y'];
        $this->forEachShapeGrid($shapeArray, $x, $y, $rotation, $flipH, $flipV, function ($gridX, $gridY) use ($mapX, $mapY, &$matchesColor) {
            $matchesColor = ($gridX == $mapX && $gridY == $mapY);
            // Stop searching once found
            if ($matchesColor) {
                return false;
            }
        });
        return $matchesColor;
    }

    public function isGridValidAndEmpty($x, $y) {
        if (!$this->isGridValid($x, $y)) {
            return false;
        }
        return ($this->boatGridUsed[$x][$y] === null);
    }

    public function isGridValid($x, $y) {
        if ($x < 0 || $x >= BOAT_TILE_WIDTH) {
            return false;
        }
        $minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[$x]) / 2;
        $maxY = $minY + BOAT_TILE_HEIGHT_PER_COLUMN[$x];
        if ($y < $minY || $y >= $maxY) {
            return false;
        }
        return true;
    }

    public function getShapeAt($x, $y) {
        if (!$this->isGridValid($x, $y)) {
            return null;
        }
        return $this->boatGridUsed[$x][$y];
    }

    public function getShapePositions($shapeId) {
        $positions = [];
        for ($x = 0; $x < BOAT_TILE_WIDTH; ++$x) {
            for ($y = 0; $y < BOAT_TILE_HEIGHT; ++$y) {
                if ($this->boatGridUsed[$x][$y] !== null && $this->boatGridUsed[$x][$y]->shapeId == $shapeId) {
                    $positions[] = new TiocPosition($x, $y);
                }
            }
        }
        return $positions;
    }

    public function isGridEmpty($x, $y) {
        if ($x < 0 || $x >= BOAT_TILE_WIDTH) {
            return true;
        }
        $minY = (BOAT_TILE_HEIGHT - BOAT_TILE_HEIGHT_PER_COLUMN[$x]) / 2;
        $maxY = $minY + BOAT_TILE_HEIGHT_PER_COLUMN[$x];
        if ($y < $minY || $y >= $maxY) {
            return true;
        }
        return ($this->boatGridUsed[$x][$y] === null);
    }

    private function forEachShapeGrid($shapeArray, $x, $y, $rotation, $paramFlipH, $paramFlipV, $callFct) {
        for ($r = 0; $r < $rotation; $r += 90) {
            $shapeArray = $this->rotateArray90($shapeArray);
        }
        $invertFlip = ($rotation == 90 || $rotation == 270);
        $flipH = ($invertFlip ? $paramFlipV : $paramFlipH);
        $flipV = ($invertFlip ? $paramFlipH : $paramFlipV);
        if ($flipH) {
            $shapeArray = $this->flipArrayH($shapeArray);
        }
        if ($flipV) {
            $shapeArray = $this->flipArrayV($shapeArray);
        }
        $h = count($shapeArray);
        $w = count($shapeArray[0]);
        for ($i = 0; $i < $w; ++$i) {
            for ($j = 0; $j < $h; ++$j) {
                if ($shapeArray[$j][$i] != 0) {
                    if ($callFct($x + $i, $y + $j) === false) {
                        return;
                    }
                }
            }
        }
    }

    private function rotateArray90($shapeArray) {
        return array_map(
            function ($index) use (&$shapeArray) {
                return array_reverse(array_map(
                    function ($row) use (&$index) {
                        return $row[$index];
                    },
                    $shapeArray
                ));
            },
            array_keys($shapeArray[0])
        );
    }

    private function flipArrayH($shapeArray) {
        return array_map(
            function ($a) {
                return array_reverse($a);
            },
            $shapeArray
        );
    }

    private function flipArrayV($shapeArray) {
        return array_reverse($shapeArray);
    }
}