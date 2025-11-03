<?php

namespace Bga\Games\TheIsleOfCatsDuel;

class TiocShapeDef
{
    private $shapeDefId;
    private $shapeArray;

    public function __construct(int $shapeDefId, array $shapeArray)
    {
        $this->shapeDefId = $shapeDefId;
        $this->shapeArray = $shapeArray;
    }

    public function shapeDefId()
    {
        return $this->shapeDefId;
    }

    public function shapeArray()
    {
        return $this->shapeArray;
    }
}

