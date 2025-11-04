
-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- TheIsleOfCatsDuel implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

-- CREATE TABLE IF NOT EXISTS `card` (
--   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
--   `card_type` varchar(16) NOT NULL,
--   `card_type_arg` int(11) NOT NULL,
--   `card_location` varchar(16) NOT NULL,
--   `card_location_arg` int(11) NOT NULL,
--   PRIMARY KEY (`card_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

-- Shapes are all common treasures, rare treasures, oshax and cats
CREATE TABLE IF NOT EXISTS `shape` (
  -- unique id with no meaning 
  `shape_id` smallint(5) unsigned NOT NULL,
  -- common treasures, rare treasures, oshax and cats
  `shape_type_id` smallint(5) unsigned NOT NULL,
  -- color (for cats only, for oshax once in boat, null otherwise)
  `color_id` smallint(5) unsigned NULL,
  -- shape from static shape definition
  `shape_def_id` smallint(5) unsigned NOT NULL,
  -- bag, table, boat, discard
  `shape_location_id` smallint(5) unsigned NOT NULL,
  -- order of the shapes in the bag, null if location is not bag
  `bag_order` smallint(5) unsigned NULL,
  -- player that has this shape, null if location is not boat
  `player_id` int(10) unsigned NULL,
  -- top corner in the boat, null if location is not boat
  `boat_top_x` smallint(5) unsigned NULL,
  -- top corner in the boat, null if location is not boat
  `boat_top_y` smallint(5) unsigned NULL,
  -- rotation (0, 90, 180, 270) in the boat, null if location is not boat
  `boat_rotation` smallint(5) unsigned NULL,
  -- flipped horizontal if true, null if location is not boat
  `boat_horizontal_flip` boolean NULL,
  -- flipped vertical if true, null if location is not boat
  `boat_vertical_flip` boolean NULL,
  -- Number to know what shape was played since last turn
  `played_move_number` int(10) unsigned NULL,
  -- card slot number, null if location is not the island
  `island_card_slot` smallint(5) unsigned NULL,
  -- cat slot number, null if location is not the island
  `island_cat_slot` smallint(5) unsigned NULL,
  
  PRIMARY KEY (`shape_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Cards are the cards that are in the deck, drafted and played
CREATE TABLE IF NOT EXISTS `card` (
  -- unique id, this is the card number
  `card_id` smallint(5) unsigned NOT NULL,
  -- location of the card: deck, player_draft, player_hand, player_table, discard
  `card_location_id` smallint(5) unsigned NOT NULL,
  -- order of the card in the deck
  `deck_order` smallint(5) unsigned NOT NULL,
  -- player that has this card, if location is not deck
  `player_id` int(10) unsigned NULL,
  -- color (for some public lesson cards only, null otherwise)
  `color_id` smallint(5) unsigned NULL,
  -- true if the card is to go on the table but is not visible to other players yet
  `player_private` boolean NOT NULL,
  -- move where the card was played
  `played_move_number` int(10) unsigned NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;