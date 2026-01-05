<?php

namespace Bga\Games\TheIsleOfCatsDuel;

class Constants {

    /*
 * Custom framework constants
 */
    const MATERIAL_TYPE_CARD = "CARD";
    const MATERIAL_TYPE_POLYO = "POLYO";
    const MATERIAL_LOCATION_HAND = "HAND";
    const MATERIAL_LOCATION_DECK = "DECK";
    const MATERIAL_LOCATION_STOCK = "STOCK";
    const MATERIAL_LOCATION_DISCARD = "DISCARD";
    const MATERIAL_LOCATION_ISLAND = "ISLAND";


    const CONTEXT_ACTION_OSHAX_MOVE = 'oshaxMove';

    const GLBL_OSHAX_LOCATION = "oshaxLocation";
    const GLBL_REMAINING_OSHAX_MOVES = 'remainingOshaxMoves';
    const GLBL_MANDATORY_MOVE_DONE = "mandatoryMoveDone";
    const GLBL_CURRENT_FISH_ACTION = "currentFishAction";
    const GLBL_DISCOVERY_TAKEN = "discoveryTaken";
    const GLBL_REMAINING_TREASURES = "remainingTreasures";
    const GLBL_BOATS_CHOSEN = "boatsChosen";


    const CARD_TYPE_ID_ANYTIME = 2;
    const CARD_TYPE_ID_TREASURE = 3;
    const CARD_TYPE_ID_LESSON = 4;
}
