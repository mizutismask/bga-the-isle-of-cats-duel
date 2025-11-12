<?php

declare(strict_types=1);

namespace Bga\Games\TheIsleOfCatsDuel\States;

use Bga\GameFramework\Actions\Types\StringParam;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\TheIsleOfCatsDuel\Constants;
use Bga\Games\TheIsleOfCatsDuel\Game;

const FISH_ACTION_COST = [
    "M" => 1,
    "J" => 2,
    "T" => 2,
    "D" => 3,
];

class PlayerTurn extends GameState {



    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 11,
            type: StateType::ACTIVE_PLAYER,
            description: clienttranslate('${actplayer} must move the Oshax'),
            descriptionMyTurn: clienttranslate('You must select where to move the Oshax (${remainingMoves} remaining moves) '),
        );
    }

    function onEnteringState(int $activePlayerId, array $args) {
    }
    /**
     * Game state arguments, example content.
     *
     * This method returns some additional information that is very specific to the `PlayerTurn` game state.
     */
    public function getArgs(): array {
        // Get some values from the current game situation from the database.
        $mandatoryMoveDone = $this->game->globals->get(Constants::GLBL_MANDATORY_MOVE_DONE);
        return [
            "playableCardsIds" => [1, 2],
            "oshaxValidMoves" => $this->game->islandMgr->getOshaxValidMoves(),
            "remainingMoves" => $this->game->globals->get(Constants::GLBL_REMAINING_OSHAX_MOVES),
            "mandatoryMoveDone" => $mandatoryMoveDone,
            "currentFishAction" => $this->game->globals->get(Constants::GLBL_CURRENT_FISH_ACTION),
            "possibleSlotsForDiscovery" => $mandatoryMoveDone ? $this->game->islandMgr->getPossibleSlotsForDiscovery() : [],
            "canTradeFishForMove" => FISH_ACTION_COST["M"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForJump" => FISH_ACTION_COST["J"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForTreasure" => FISH_ACTION_COST["T"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
            "canTradeFishForDiscovery" => FISH_ACTION_COST["D"] <= $this->game->playerFishCounter->get($this->game->getMostlyActivePlayerId()),
        ];
    }

    /**
     * Player action, example content.
     *
     * In this scenario, each time a player plays a card, this method will be called. This method is called directly
     * by the action trigger on the front side with `bgaPerformAction`.
     *
     * @throws UserException
     */
    #[PossibleAction]
    public function actMoveOshax(int $slot, int $activePlayerId, array $args) {
        // check input values
        if (!$this->game->islandMgr->isValidSlot($slot)) {
            throw new UserException('This slot is not valid');
        }

        $validMoves = $args['oshaxValidMoves'];
        if (!in_array($slot, $validMoves)) {
            throw new UserException('You cannot reach this location');
        }

        $fishAction = $this->globals->get(Constants::GLBL_CURRENT_FISH_ACTION);
        $remainingMoves = $this->game->globals->get(Constants::GLBL_REMAINING_OSHAX_MOVES);
        if ($fishAction != "J" && $remainingMoves == 0) {
            throw new UserException('You have no remaining move, use a fish to get an additional one');
        }

        $this->game->islandMgr->moveOshaxToSlot($activePlayerId, $slot);

        if ($fishAction == "J") {
            $fishAction = $this->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, null);
        }

        return PlayerTurn::class;
    }

    #[PossibleAction]
    public function actTradeFishForAction(#[StringParam(enum: ['M', 'J', "T", "D"])] $additionalAction, int $activePlayerId, array $args) {
        // check input values
        if (!$args['mandatoryMoveDone']) {
            throw new UserException('You cannot use fish before moving the Oshax');
        }

        if (FISH_ACTION_COST[$additionalAction] > $this->game->playerFishCounter->get($activePlayerId)) {
            throw new UserException('You don’t have enough fish');
        }

        switch ($additionalAction) {
            case 'M':
            case 'J':
                $this->globals->inc(Constants::GLBL_REMAINING_OSHAX_MOVES, 1);
                break;
        }
        if ($additionalAction != "M") {
            $this->globals->set(Constants::GLBL_CURRENT_FISH_ACTION, $additionalAction);
        }
        $this->game->playerFishCounter->inc($activePlayerId, FISH_ACTION_COST[$additionalAction] * -1);

        return PlayerTurn::class;
    }
    #[PossibleAction]
    public function actPlayCard(int $card_id, int $activePlayerId, array $args) {
        // check input values
        $playableCardsIds = $args['playableCardsIds'];
        if (!in_array($card_id, $playableCardsIds)) {
            throw new UserException('Invalid card choice');
        }

        // Add your game logic to play a card here.
        $card_name = Game::$CARD_TYPES[$card_id]['card_name'];

        // Notify all players about the card played.
        $this->notify->all("cardPlayed", clienttranslate('${player_name} plays ${card_name}'), [
            "player_id" => $activePlayerId,
            "player_name" => $this->game->getPlayerNameById($activePlayerId), // remove this line if you uncomment notification decorator
            "card_name" => $card_name, // remove this line if you uncomment notification decorator
            "card_id" => $card_id,
            "i18n" => ['card_name'], // remove this line if you uncomment notification decorator
        ]);

        // in this example, the player gains 1 points each time he plays a card
        $this->playerScore->inc($activePlayerId, 1);

        // at the end of the action, move to the next state
        return NextPlayer::class;
    }

    /**
     * Player action, example content.
     *
     * In this scenario, each time a player pass, this method will be called. This method is called directly
     * by the action trigger on the front side with `bgaPerformAction`.
     */
    #[PossibleAction]
    public function actPass(int $activePlayerId) {
        // Notify all players about the choice to pass.
        $this->notify->all("pass", "", [
            //"player_id" => $activePlayerId,
            //"player_name" => $this->game->getPlayerNameById($activePlayerId), // remove this line if you uncomment notification decorator
        ]);


        // at the end of the action, move to the next state
        return NextPlayer::class;
    }

    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: play a random card).
     * 
     * See more about Zombie Mode: https://en.doc.boardgamearena.com/Zombie_Mode
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, 
     * but use the $playerId passed in parameter and $this->game->getPlayerNameById($playerId) instead.
     */
    function zombie(int $playerId) {
        // Example of zombie level 0: return NextPlayer::class; or $this->actPass($playerId);

        // Example of zombie level 1:
        $args = $this->getArgs();
        $zombieChoice = $this->getRandomZombieChoice($args['playableCardsIds']); // random choice over possible moves
        return $this->actPlayCard($zombieChoice, $playerId, $args); // this function will return the transition to the next state
    }
}
