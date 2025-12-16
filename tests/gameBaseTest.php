<?php

use Bga\Games\TheIsleOfCatsDuel\Game;
use Bga\Games\TheIsleOfCatsDuel\PlayerUtilTrait;

define("APP_GAMEMODULE_PATH", "../misc/"); // include path to stubs, which defines "table.game.php" and other classes
require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');
//require_once('../_ide_helper.php');
require_once('../modules/php/PlayerUtilTrait.php');
require_once('../modules/php/DBUtilTrait.php');
require_once('../modules/php/DebugUtilTrait.php');
require_once('../modules/php/UtilTrait.php');
require_once('../modules/php/TiocShapeMgr.php');
require_once('../modules/php/TiocShapeDefMgr.php');
require_once('../modules/php/TiocShapeDef.php');
require_once('../modules/php/TiocShape.php');
require_once('../modules/php/TiocBoatGrid.php');
require_once('../modules/php/Game.php');

abstract class GameTestBase extends Game {
    function __construct() {
        // parent::__construct();
        //include '../material.inc.php'; // this is how this normally included, from constructor
    }

    abstract function testAll();


    /**
     * To redefine if players count is not 3
     */
    function getPlayersIds() {
        return [2333092, 2333093];
    }

    function getBoatShape($playerId) {
        return match ($playerId) {
            1 => "OBoat",
            2 => "IBoat",
        };
    }


    function convertNumbersToGrid(string $textGrid) {
        /*  $grid = $this->initGrid();
        $rows = preg_split("/\r\n|\n|\r/", trim($textGrid));
        foreach ($rows as $iRow => $row) {
            $row = trim($row);
            //self::dump('', compact("iRow", "row"));
            for ($iCol = 0; $iCol < GRID_SIZE; $iCol++) {
                $animal = intval($row[$iCol]);
                //self::dump('', compact("iRow", "iCol", "animal"));
                if ($animal === 0) {
                    $biome = new Biome(0, -1, 0);
                } else if ($animal === ANIMAL_OTTER) {
                    $biome = new Biome(ANIMAL_OTTER, LAND_SNOW, RIVER_UP);
                    self::dump(
                        'WARNING, you might have to specify manually land and river for otter in ',
                        implode(["[", $iRow, "]", "[", $iCol, "]"])
                    );
                } else {
                    $biome = new Biome($animal);
                }
                $grid[$iRow][$iCol] = $biome;
            }
        }
        //$this->displayGrid($grid);
        return $grid;*/
    }

    function displayResult($testName, $equal, $result) {
        echo ($testName);
        if ($equal) {
            echo " : SUCCESS\n";
        } else {
            echo " : FAILURE\n";
            echo is_array($result) ? "Found: " . json_encode($result) : "Found: $result\n";
        }
    }

    function expectResult($result,  $expectedResult, $testName) {
        $equal = $result == $expectedResult;
        $this->displayResult($testName, $equal, $result);
    }

    function expectHexResult($result,  $expectedCol, $expectedRow, $testName) {
        $equal = $result["col"] == $expectedCol && $result["row"] == $expectedRow;
        $this->displayResult($testName, $equal, $result);
    }

    function testExemple() {
        //get this typing displayPlayerGrid() in the chat, remove the last number of each line except the last one
        $grid = $this->convertNumbersToGrid("
            121641
            355182
            245716
            974779
            258725
            383687
        ");

        //give more info for otters
        /*   $grid[2][3] = new Biome(ANIMAL_OTTER, LAND_JUNGLE, RIVER_DOWN);
        $grid[3][1] = new Biome(ANIMAL_OTTER, LAND_SAVANNAH, RIVER_DOWN);
        $grid[3][3] = new Biome(ANIMAL_OTTER, LAND_SAVANNAH, RIVER_UP);
        $grid[3][4] = new Biome(ANIMAL_OTTER, LAND_JUNGLE, RIVER_DOWN);
        $grid[4][3] = new Biome(ANIMAL_OTTER, LAND_SAVANNAH, RIVER_DOWN);
        $grid[4][3] = new Biome(ANIMAL_OTTER, LAND_JUNGLE, RIVER_DOWN);

        $result = $this->calculateGoalRiverConnectedToLand($grid, LAND_WATER);*/

        //test result
        /*  $equal = $result == 10;
        $this->displayResult(__FUNCTION__, $equal, $result);*/
    }
}
