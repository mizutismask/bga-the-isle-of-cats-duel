<?php

use Bga\Games\TheIsleOfCatsDuel\TiocShapeMgr;

use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_APPLE_MIDDLE;
use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_CORN_FRONT;
use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_MOON_BOTTOM;
use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_MOON_TOP;
use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_PARROT_BACK;
use const Bga\Games\TheIsleOfCatsDuel\BOAT_ROOMS_ID_PARROT_FRONT;

define("APP_GAMEMODULE_PATH", "../misc/"); // include path to stubs, which defines "table.game.php" and other classes
require_once('./gameBaseTest.php');

class GameTest extends GameTestBase { // this is your game class defined in ggg.game.php
    public TiocShapeMgr $shapeMgr;
    function __construct() {
        // parent::__construct();
        //include '../material.inc.php'; // this is how this normally included, from constructor
    }

    /** Redefine some function of the game to mock data. Todo : rename getData to match your function */
    function getData($playerId = null) {

        return [];
    }

    // class tests
    function testGetPlayerUnfilledRoomIdsWithEmptyBoat() {
        $shapeMgr = new TiocShapeMgr($this, []);
        foreach (["OBoat", "IBoat"] as $boat) {
            $result = $shapeMgr->getPlayerUnfilledRoomIds(1, $boat);
            $equal = $result == [
                BOAT_ROOMS_ID_PARROT_BACK,
                BOAT_ROOMS_ID_MOON_TOP,
                BOAT_ROOMS_ID_MOON_BOTTOM,
                BOAT_ROOMS_ID_APPLE_MIDDLE,
                BOAT_ROOMS_ID_CORN_FRONT,
                BOAT_ROOMS_ID_PARROT_FRONT,
                BOAT_ROOMS_ID_PARROT_FRONT + 1
            ];
            $this->displayResult(__FUNCTION__, $equal, $result);
        }
    }

    function testAll() {
        $this->testGetPlayerUnfilledRoomIdsWithEmptyBoat();
    }
}

$test1 = new GameTest();
$test1->testAll();
