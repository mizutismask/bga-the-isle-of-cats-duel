<?php

namespace Bga\Games\TheIsleOfCatsDuel;

use Bga\GameFramework\Actions\Debug;
use Bga\GameFramework\SystemException;
use Bga\Games\TheIsleOfCatsDuel\States\PlayerTurn;

trait DebugUtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function debugSetup() {
        if (!$this->isStudio()) {
            return;
        }

        //$this->debugSetDestinationInHand(7, 2343492);
        //$this->gamestate->changeActivePlayer(2343492);
    }

    function debug_setOshaxLocation(int $slotNumber) {
        $this->globals->set(Constants::GLBL_OSHAX_LOCATION, $slotNumber);
    }
    function debug_addFish(int $fishCount = 100) {
        $this->playerFishCounter->inc($this->getCurrentPlayerId(), $fishCount);
    }

    function debug_LogBoatShapes() {
        $playerId = $this->getCurrentPlayerId();
        $shapes = $this->shapeMgr->load();
        $shapes = array_filter($shapes, function ($shape) use ($playerId) {
            return $shape->isOnPlayerBoat($playerId);
        });

        $this->dump('*******************', json_encode($shapes));
    }

    function debug_loadBoat(string $jsonBoatContent) {
        if (!$jsonBoatContent) {
            throw new SystemException("Provide json boat content (you can retrieve it from another game with debug_LogBoatShapes)");
        }
        $playerId = $this->getCurrentPlayerId();
        //empty boat
        $this->shapeMgr->emptyBoat($playerId);

        $shapes = json_decode($jsonBoatContent, true);
        $shapes = array_map(
            fn(array $shapeData) => TiocShape::fromArray($shapeData),
            $shapes
        );
        $this->shapeMgr->loadBoat($playerId, $shapes);
    }

    function debug_fillEmptyRoom(int $roomId) {
        $playerId = $this->getCurrentPlayerId();
        $shapesDesc =  match ($roomId) {
            BOAT_ROOMS_ID_PARROT_BACK => '{"5":{"shapeId":50,"shapeTypeId":2,"colorId":null,"shapeDefId":100,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":1,"boatTopY":7,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1}},"width":1,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"18":{"shapeId":63,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":0,"boatTopY":4,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"19":{"shapeId":64,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":1,"boatTopY":3,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"20":{"shapeId":65,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":1,"boatTopY":1,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":2,"boatTopY":5,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null}}',
            BOAT_ROOMS_ID_MOON_TOP => '{"11":{"shapeId":56,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":1,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"12":{"shapeId":57,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":0,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"20":{"shapeId":65,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":3,"boatTopY":0,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"26":{"shapeId":71,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":1,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":0,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null}}',
            BOAT_ROOMS_ID_MOON_BOTTOM => '{"11":{"shapeId":56,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":8,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"12":{"shapeId":57,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":7,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"20":{"shapeId":65,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":3,"boatTopY":7,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"26":{"shapeId":71,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":8,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":7,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null}}',
            BOAT_ROOMS_ID_APPLE_MIDDLE => '{"21":{"shapeId":66,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":11,"boatTopY":3,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"22":{"shapeId":67,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":5,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"23":{"shapeId":68,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":4,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"24":{"shapeId":69,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"25":{"shapeId":70,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":5,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"26":{"shapeId":71,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":4,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null}}',
            BOAT_ROOMS_ID_CORN_FRONT => '{"22":{"shapeId":67,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":19,"boatTopY":3,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"23":{"shapeId":68,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":16,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"24":{"shapeId":69,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":16,"boatTopY":5,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"25":{"shapeId":70,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":16,"boatTopY":4,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"26":{"shapeId":71,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":16,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":16,"boatTopY":2,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null}}',
            BOAT_ROOMS_ID_PARROT_FRONT => '{"5":{"shapeId":50,"shapeTypeId":2,"colorId":null,"shapeDefId":100,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":20,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1}},"width":1,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"20":{"shapeId":65,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":20,"boatTopY":4,"boatRotation":180,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null}}',
            default => '{"3":{"shapeId":48,"shapeTypeId":2,"colorId":null,"shapeDefId":100,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":13,"boatTopY":1,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1}},"width":1,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"4":{"shapeId":49,"shapeTypeId":2,"colorId":null,"shapeDefId":100,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":14,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1}},"width":1,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"5":{"shapeId":50,"shapeTypeId":2,"colorId":null,"shapeDefId":100,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":2,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1}},"width":1,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"7":{"shapeId":52,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":14,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"8":{"shapeId":53,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":14,"boatTopY":4,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"9":{"shapeId":54,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":14,"boatTopY":5,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"10":{"shapeId":55,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":12,"boatTopY":5,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"11":{"shapeId":56,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":12,"boatTopY":4,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"12":{"shapeId":57,"shapeTypeId":2,"colorId":null,"shapeDefId":101,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":12,"boatTopY":3,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1}},"width":2,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"14":{"shapeId":59,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":14,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"15":{"shapeId":60,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":11,"boatTopY":1,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"16":{"shapeId":61,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":10,"boatTopY":7,"boatRotation":90,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"17":{"shapeId":62,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":3,"boatTopY":6,"boatRotation":180,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"18":{"shapeId":63,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":10,"boatTopY":0,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"19":{"shapeId":64,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":9,"boatTopY":1,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"20":{"shapeId":65,"shapeTypeId":2,"colorId":null,"shapeDefId":102,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":3,"boatTopY":1,"boatRotation":90,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1}},"width":2,"height":2,"playedMoveNumber":1,"islandCatSlot":null},"21":{"shapeId":66,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":11,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"22":{"shapeId":67,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":11,"boatTopY":7,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"23":{"shapeId":68,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":8,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"24":{"shapeId":69,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":6,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"25":{"shapeId":70,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":4,"boatTopY":3,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"26":{"shapeId":71,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":3,"boatTopY":3,"boatRotation":270,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"27":{"shapeId":72,"shapeTypeId":2,"colorId":null,"shapeDefId":103,"shapeLocationId":4,"bagOrder":null,"playerId":2333092,"boatTopX":5,"boatTopY":2,"boatRotation":0,"boatHorizontalFlip":0,"boatVerticalFlip":0,"shapeArray":{"0":{"0":1,"1":1,"2":1}},"width":3,"height":1,"playedMoveNumber":1,"islandCatSlot":null},"38":{"shapeId":22,"shapeTypeId":0,"colorId":2,"shapeDefId":404,"shapeLocationId":4,"bagOrder":11,"playerId":2333092,"boatTopX":13,"boatTopY":1,"boatRotation":90,"boatHorizontalFlip":0,"boatVerticalFlip":1,"shapeArray":{"0":{"0":0,"1":1},"1":{"0":1,"1":1},"2":{"0":1,"1":1}},"width":2,"height":3,"playedMoveNumber":1,"islandCatSlot":8}}',
        };

        $shapes = json_decode($shapesDesc, true);
        $shapes = array_map(
            fn(array $shapeData) => TiocShape::fromArray($shapeData),
            $shapes
        );
        $this->shapeMgr->loadBoat($playerId, $shapes);
    }

    function debug_emptyBoat() {
        $playerId = $this->getCurrentPlayerId();
        $this->shapeMgr->emptyBoat($playerId);
    }

    function debug_resetIsland() {
        $this->resetIsland();
    }

    #[Debug(reload: true)]
    function debug_almostFillBoat() {
        $playerId = $this->getCurrentPlayerId();
        $shapes = $this->shapeMgr->getBagShapes();
        foreach ($shapes as $shape) {
            $placementArgs =  $this->shapeMgr->getFirstPossiblePlacementForShapeOnBoat($playerId, $shape);
            if ($placementArgs) {
                $this->shapeMgr->validateAndPlaceOnBoat(
                    $playerId,
                    $this->getPlayerGlobal($playerId, "boat"),
                    $shape->shapeTypeId,
                    $shape->shapeId,
                    $placementArgs['x'],
                    $placementArgs['y'],
                    $placementArgs['rotation'],
                    $placementArgs['flipH'],
                    $placementArgs['flipV'],
                    true,
                    null

                );
            }
        }
    }

    /*function debug_CompleteDestinations() {
        $players = $this->getPlayersIds();
        $restriction = " limit " . ($this->getInitialDestinationCardNumber() - 1);
        foreach ($players as $playerId) {
            static::DbQuery("UPDATE `destination` set `completed` = true WHERE `card_location_arg`= $playerId" . $restriction);
        }
        $this->gamestate->jumpToState(ST_PLAYER_CHOOSE_ACTION);
    }*/

    /*function debug_EmptyDestinationDeck() {
        $this->destinations->moveAllCardsInLocation('deck', 'void');
    }*/

    /*function debug_AlmostEmptyDestinationDeck() {
        $moveNumber = $this->getRemainingDestinationCardsInDeck() - 1;
        $this->destinations->pickCardsForLocation($moveNumber, 'deck', 'discard');
    }*/


    /*function debug_clear() {
        static::DbQuery("DELETE FROM `claimed_routes`");
        $this->setGlobalVariable(LAST_BLUE_ROUTES, [null, null, null]);
        $this->setGameStateValue(BLUEPOINT_ACTIONS_REMAINING, 0);
        $this->debugResetArrowsLeft();
        static::DbQuery("UPDATE `destination` set `completed` = false");
    }*/
}
