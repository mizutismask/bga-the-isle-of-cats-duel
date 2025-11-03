<?php

namespace Bga\Games\TheIsleOfCatsDuel;


class TiocShapeDefMgr
{
    public const COMMON_TREASURE_IDS = [100, 101, 102, 103];
    public const CAT_IDS = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416];
    private $shapes;
    private $shapesById;

    public function __construct()
    {
        $this->fillShapes();
        $this->fillShapesById();
    }

    function shapeFromId(int $id)
    {
        return $this->shapesById[$id];
    }

    private function fillShapesById()
    {
        $this->shapesById = [];
        foreach ($this->shapes as $shape) {
            $this->shapesById[$shape->shapeDefId()] = $shape;
        }
    }

    private function fillShapes()
    {
        $this->shapes = [];
        // Common treasures - 1xx
        // x
        $this->shapes[] = new TiocShapeDef(100, [
            [1],
        ]);
        // xx
        $this->shapes[] = new TiocShapeDef(101, [
            [1, 1],
        ]);
        // xxx
        $this->shapes[] = new TiocShapeDef(102, [
            [0, 1],
            [1, 1],
        ]);
        //  x
        // xx
        $this->shapes[] = new TiocShapeDef(103, [
            [1, 1, 1],
        ]);
        
       
        // Cats - 4xx
        $this->shapes[] = new TiocShapeDef(400, [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(401, [
            [0, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(402, [
            [0, 1],
            [1, 1],
            [1, 1],
            [1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(403, [
            [0, 1],
            [1, 1],
            [0, 1],
            [0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(404, [
            [0, 1],
            [1, 1],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(405, [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(406, [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(407, [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(408, [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(409, [
            [1, 1],
            [1, 0],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(410, [
            [1, 1, 1, 0],
            [1, 0, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(411, [
            [0, 1, 1],
            [1, 1, 1],
            [0, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(412, [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(413, [
            [0, 0, 1, 1],
            [1, 1, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(414, [
            [0, 1, 1],
            [1, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(415, [
            [1],
            [1],
            [1],
            [1],
            [1],
        ]);
        $this->shapes[] = new TiocShapeDef(416, [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]);
    }
}
