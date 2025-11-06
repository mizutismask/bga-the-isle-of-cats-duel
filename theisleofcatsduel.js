define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-zoom', '1.0.0'),
    getLibUrl('bga-animations', '1.0.1'),
    getLibUrl('bga-cards', '1.0.2'),
    getLibUrl('bga-autofit', '1.0.0'),
],
function defineFunction(dojo, declare, gamegui, counter, BgaZoom, BgaAnimations, BgaCards, BgaAutofit) {
class BgaHelpButton {
}
class BgaHelpPopinButton extends BgaHelpButton {
    constructor(settings) {
        super();
        this.settings = settings;
    }
    add(toElement) {
        const button = document.createElement('button');
        button.classList.add('bga-help_button', 'bga-help_popin-button', ...(this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []));
        button.innerHTML = `?`;
        if (this.settings.buttonBackground) {
            button.style.setProperty('--background', this.settings.buttonBackground);
        }
        if (this.settings.buttonColor) {
            button.style.setProperty('--color', this.settings.buttonColor);
        }
        toElement.appendChild(button);
        button.addEventListener('click', () => this.showHelp());
    }
    showHelp() {
        var _a, _b, _c;
        const popinDialog = new window.ebg.popindialog();
        popinDialog.create('bgaHelpDialog');
        popinDialog.setTitle(this.settings.title);
        popinDialog.setContent(`<div id="help-dialog-content">${(_a = this.settings.html) !== null && _a !== void 0 ? _a : ''}</div>`);
        (_c = (_b = this.settings).onPopinCreated) === null || _c === void 0 ? void 0 : _c.call(_b, document.getElementById('help-dialog-content'));
        popinDialog.show();
    }
}
class BgaHelpExpandableButton extends BgaHelpButton {
    constructor(settings) {
        super();
        this.settings = settings;
    }
    add(toElement) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let folded = (_a = this.settings.defaultFolded) !== null && _a !== void 0 ? _a : true;
        if (this.settings.localStorageFoldedKey) {
            const localStorageValue = localStorage.getItem(this.settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        const button = document.createElement('button');
        button.dataset.folded = folded.toString();
        button.classList.add('bga-help_button', 'bga-help_expandable-button', ...(this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []));
        button.innerHTML = `
            <div class="bga-help_folded-content ${((_b = this.settings.foldedContentExtraClasses) !== null && _b !== void 0 ? _b : '').split(/\s+/g)}">${(_c = this.settings.foldedHtml) !== null && _c !== void 0 ? _c : ''}</div>
            <div class="bga-help_unfolded-content  ${((_d = this.settings.unfoldedContentExtraClasses) !== null && _d !== void 0 ? _d : '').split(/\s+/g)}">${(_e = this.settings.unfoldedHtml) !== null && _e !== void 0 ? _e : ''}</div>
        `;
        button.style.setProperty('--expanded-width', (_f = this.settings.expandedWidth) !== null && _f !== void 0 ? _f : 'auto');
        button.style.setProperty('--expanded-height', (_g = this.settings.expandedHeight) !== null && _g !== void 0 ? _g : 'auto');
        button.style.setProperty('--expanded-radius', (_h = this.settings.expandedRadius) !== null && _h !== void 0 ? _h : '10px');
        toElement.appendChild(button);
        button.addEventListener('click', () => {
            button.dataset.folded = button.dataset.folded == 'true' ? 'false' : 'true';
            if (this.settings.localStorageFoldedKey) {
                localStorage.setItem(this.settings.localStorageFoldedKey, button.dataset.folded);
            }
        });
    }
}
class HelpManager {
    constructor(game, settings) {
        this.game = game;
        if (!(settings === null || settings === void 0 ? void 0 : settings.buttons)) {
            throw new Error('HelpManager need a `buttons` list in the settings.');
        }
        const leftSide = document.getElementById('left-side');
        const buttons = document.createElement('div');
        buttons.id = `bga-help_buttons`;
        leftSide.appendChild(buttons);
        settings.buttons.forEach(button => button.add(buttons));
    }
}
/**
 * Jump to entry.
 */
class JumpToEntry {
    constructor(
    /**
     * Label shown on the entry. For players, it's player name.
     */
    label, 
    /**
     * HTML Element id, to scroll into view when clicked.
     */
    targetId, 
    /**
     * Any element that is useful to customize the link.
     * Basic ones are 'color' and 'colorback'.
     */
    data = {}) {
        this.label = label;
        this.targetId = targetId;
        this.data = data;
    }
}
class JumpToManager {
    constructor(game, settings) {
        var _a, _b, _c;
        this.game = game;
        this.settings = settings;
        const entries = [
            ...((_a = settings === null || settings === void 0 ? void 0 : settings.topEntries) !== null && _a !== void 0 ? _a : []),
            ...((_b = settings === null || settings === void 0 ? void 0 : settings.playersEntries) !== null && _b !== void 0 ? _b : this.createEntries(Object.values(game.gamedatas.players)))
        ];
        this.createPlayerJumps(entries);
        let folded = (_c = settings === null || settings === void 0 ? void 0 : settings.defaultFolded) !== null && _c !== void 0 ? _c : false;
        if (settings === null || settings === void 0 ? void 0 : settings.localStorageFoldedKey) {
            const localStorageValue = localStorage.getItem(settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        document.getElementById('bga-jump-to_controls').classList.toggle('folded', folded);
    }
    createPlayerJumps(entries) {
        var _a, _b, _c, _d;
        document.getElementById(`game_play_area_wrap`).insertAdjacentHTML('afterend', `
        <div id="bga-jump-to_controls">        
            <div id="bga-jump-to_toggle" class="bga-jump-to_link ${(_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : ''} toggle" style="--color: ${(_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.toggleColor) !== null && _d !== void 0 ? _d : 'black'}">
                ⇔
            </div>
        </div>`);
        document.getElementById(`bga-jump-to_toggle`).addEventListener('click', () => this.jumpToggle());
        entries.forEach(entry => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            let html = `<div id="bga-jump-to_${entry.targetId}" class="bga-jump-to_link ${(_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : ''}">`;
            if ((_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.showEye) !== null && _d !== void 0 ? _d : true) {
                html += `<div class="eye"></div>`;
            }
            if (((_f = (_e = this.settings) === null || _e === void 0 ? void 0 : _e.showAvatar) !== null && _f !== void 0 ? _f : true) && ((_g = entry.data) === null || _g === void 0 ? void 0 : _g.id)) {
                let cssUrl = (_h = entry.data) === null || _h === void 0 ? void 0 : _h.avatarUrl;
                if (!cssUrl) {
                    const img = document.getElementById(`avatar_${entry.data.id}`);
                    const url = img === null || img === void 0 ? void 0 : img.src;
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    if (url) {
                        cssUrl = `url('${url}')`;
                    }
                }
                if (cssUrl) {
                    html += `<div class="bga-jump-to_avatar" style="--avatar-url: ${cssUrl};"></div>`;
                }
            }
            html += `
                <span class="bga-jump-to_label">${entry.label}</span>
            </div>`;
            //
            document.getElementById(`bga-jump-to_controls`).insertAdjacentHTML('beforeend', html);
            const entryDiv = document.getElementById(`bga-jump-to_${entry.targetId}`);
            Object.getOwnPropertyNames((_j = entry.data) !== null && _j !== void 0 ? _j : []).forEach(key => {
                entryDiv.dataset[key] = entry.data[key];
                entryDiv.style.setProperty(`--${key}`, entry.data[key]);
            });
            entryDiv.addEventListener('click', () => this.jumpTo(entry.targetId));
        });
        const jumpDiv = document.getElementById(`bga-jump-to_controls`);
        jumpDiv.style.marginTop = `-${Math.round(jumpDiv.getBoundingClientRect().height / 2)}px`;
    }
    jumpToggle() {
        var _a;
        const jumpControls = document.getElementById('bga-jump-to_controls');
        jumpControls.classList.toggle('folded');
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.localStorageFoldedKey) {
            localStorage.setItem(this.settings.localStorageFoldedKey, jumpControls.classList.contains('folded').toString());
        }
    }
    jumpTo(targetId) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    getOrderedPlayers(unorderedPlayers) {
        const players = unorderedPlayers.sort((a, b) => Number(a.playerNo) - Number(b.playerNo));
        const playerIndex = players.findIndex(player => Number(player.id) === Number(this.game.player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }
    createEntries(players) {
        const orderedPlayers = this.getOrderedPlayers(players);
        return orderedPlayers.map(player => new JumpToEntry(player.name, `player-table-${player.id}`, {
            'color': '#' + player.color,
            'colorback': player.color_back ? '#' + player.color_back : null,
            'id': player.id,
        }));
    }
}
class CardsManagerBase extends BgaCards.Manager {
    /**Generates the tooltip from getTooltipContent elements. */
    getTooltip(card) {
        const wrapper = dojo.create('div', { class: 'tooltip-wrapper' });
        this.getTooltipContent().forEach((attr) => {
            const attrContent = attr.contentProvider(card);
            if (attrContent) {
                wrapper.appendChild(dojo.create('h3', { class: attr.classes, innerHTML: attr.title }));
                wrapper.appendChild(dojo.create('span', { innerHTML: attrContent }));
            }
        });
        return wrapper.outerHTML;
    }
    getTooltipContent() {
        return [];
    }
    setBackground(cardDiv, cardTypeArg, cardsUrl, imagesPerRow) {
        cardDiv.style.backgroundImage = `url('${cardsUrl}')`;
        const imagePosition = cardTypeArg - 1;
        const row = Math.floor(imagePosition / imagesPerRow);
        const xBackgroundPercent = (imagePosition - row * imagesPerRow) * 100;
        const yBackgroundPercent = row * 100;
        cardDiv.style.backgroundPositionX = `-${xBackgroundPercent}%`;
        cardDiv.style.backgroundPositionY = `-${yBackgroundPercent}%`;
        cardDiv.style.backgroundSize = `${imagesPerRow * 100}%`;
    }
}
// <reference path="../card-manager.ts"/>
const IMAGE_ITEMS_PER_ROW = 10;
class CardsManager extends CardsManagerBase {
    constructor(game) {
        super({
            animationManager: game.animationManager,
            type: 'card',
            getId: (card) => `theisleofcatsduel-card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('theisleofcatsduel-card');
                div.dataset.cardId = '' + card.id;
                div.dataset.cardType = '' + card.type;
            },
            setupFrontDiv: (card, div) => {
                this.setFrontBackground(div, card.type_arg);
                const tokensId = `${super.getId(card)}-tokens`;
                const textId = `${super.getId(card)}-text`;
                div.id = `${super.getId(card)}-front`;
                //add help
                const helpId = `${super.getId(card)}-front-info`;
                if (!$(helpId)) {
                    const info = document.createElement('div');
                    info.id = helpId;
                    info.innerText = '?';
                    info.classList.add('css-icon', 'card-info');
                    div.appendChild(info);
                    const tooltipContent = this.getTooltip(card);
                    this.game.addTooltipHtml(div.id, tooltipContent);
                    this.game.addTooltipOnClickHelpButton(info.id, tooltipContent);
                }
                //adds tokens locations
                if (!$(tokensId)) {
                    const container = document.createElement('div');
                    container.id = tokensId;
                    container.classList.add('tokens-location-wrapper');
                    div.appendChild(container);
                }
                if (!$(textId)) {
                    const container = document.createElement('div');
                    container.id = tokensId;
                    container.classList.add('bga-autofit', 'card-text-wrapper');
                    div.appendChild(container);
                }
            },
            setupBackDiv: (card, div) => {
                div.style.backgroundImage = `url('${g_gamethemeurl}img/theisleofcatsduel-card-background.jpg')`;
            }
        });
        this.game = game;
    }
    getCardName(card) {
        return `<div class="cstm-card-name">${card.name}</div>`;
    }
    getTooltipContent() {
        return [{ title: _('Objective'), contentProvider: (c) => this.getDesc(c) }];
    }
    getDesc(card) {
        return 'todo';
    }
    setFrontBackground(cardDiv, cardType) {
        const imageUrl = `${g_gamethemeurl}img/theisleofcatsduel-card-background.jpg`;
        cardDiv.style.backgroundImage = `url('${imageUrl}')`;
        const imagePosition = cardType - 1;
        const row = Math.floor(imagePosition / IMAGE_ITEMS_PER_ROW);
        const xBackgroundPercent = (imagePosition - row * IMAGE_ITEMS_PER_ROW) * 100;
        const yBackgroundPercent = row * 100;
        cardDiv.style.backgroundPositionX = `-${xBackgroundPercent}%`;
        cardDiv.style.backgroundPositionY = `-${yBackgroundPercent}%`;
        cardDiv.style.backgroundSize = `${IMAGE_ITEMS_PER_ROW * 100}%`;
    }
}
const ANIMATION_MS = 500;
const SCORE_MS = 1500;
const ACTION_TIMER_DURATION = 6;
const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };
class BaseGame {
    constructor() {
        this.playerTables = [];
        this.actionTimerId = null;
        this.isTouch = window.matchMedia('(hover: none)').matches;
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        this.customSounds = [
        //'sound1'
        ];
        this.contentAnchor = `game_play_area`;
        log('Base game constructor');
    }
    get gamedatas() {
        return this.gameui.gamedatas;
    }
    get statusBar() {
        return this.gameui.statusBar;
    }
    includeHtmlBasicTemplate() {
        dojo.place(`
		<div id="custom-game-area">
			<div id="score">
				<div id="table-wrapper">
					<table>
						<thead>
							<tr id="scoretr"></tr>
						</thead>
						<tbody id="score-table-body">
						</tbody>
					</table>
				</div>
			</div>

			<div id="player-tables"></div>
		</div>`, 'game_play_area_background', 'after');
    }
    /**
     * Returns the player ID corresponding to the given position.
     */
    getPlayerIdFromPosition(position) {
        const players = this.gamedatas.players;
        for (const playerId in players) {
            if (players[playerId].playerNo === position) {
                return Number(playerId);
            }
        }
        return null;
    }
    isUserLocaleFrench() {
        const userLocale = navigator.language || navigator.languages[0];
        return userLocale.startsWith('fr-');
    }
    /**
     * Get current player.
     */
    getCurrentPlayer() {
        return this.gamedatas.players[this.getPlayerId()];
    }
    getPlayerId() {
        return Number(this.gameui.player_id);
    }
    getPlayerScore(playerId) {
        var _a, _b;
        return (_b = (_a = this.gameui.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.getValue()) !== null && _b !== void 0 ? _b : Number(this.gamedatas.players[playerId].score);
    }
    getPlayersCount() {
        return Object.values(this.gamedatas.players).length;
    }
    getOpponentId(playerId) {
        const players = Object.keys(this.gamedatas.players);
        if (players.length != 2)
            throw new Error('Impossible to know who is the opponent in a non 2 players game');
        return players.filter((player) => player !== playerId)[0];
    }
    isNotSpectator() {
        //log('isSpectator', this.gameui.isSpectator)
        return (this.gameui.isSpectator == false ||
            Object.keys(this.gamedatas.players).includes(this.getPlayerId().toString()));
    }
    setGamestateDescription(property = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = originalState['description' + property];
        this.gamedatas.gamestate.descriptionmyturn = originalState['descriptionmyturn' + property];
        this.gameui.updatePageTitle();
    }
    setupPlayerOrderHints(player) {
        const nameDiv = document.querySelector('#player_name_' + player.id + ' a');
        const surroundingPlayers = this.getSurroundingPlayersIds(player);
        const previousId = this.gamedatas.turnOrderClockwise ? surroundingPlayers[0] : surroundingPlayers[1];
        const nextId = this.gamedatas.turnOrderClockwise ? surroundingPlayers[1] : surroundingPlayers[0];
        this.updatePlayerHint(player, previousId, '_previous_player', _('Previous player: '), '&lt;', nameDiv, 'before');
        this.updatePlayerHint(player, nextId, '_next_player', _('Next player: '), '&gt;', nameDiv, 'after');
    }
    updatePlayerHint(currentPlayer, otherPlayerId, divSuffix, titlePrefix, content, parentDivId, location) {
        if (!$(currentPlayer.id + divSuffix)) {
            dojo.create('span', {
                id: currentPlayer.id + divSuffix,
                class: 'playerOrderHelp',
                title: titlePrefix + this.gamedatas.players[otherPlayerId].name,
                style: 'color:#' + this.gamedatas.players[otherPlayerId]['color'] + ';',
                innerHTML: content
            }, parentDivId, location);
        }
    }
    /**
     * Gets the player ids of the previous and the next player regarding the player given in parameter
     * @param player
     * @returns an array with the previous player at 0 and the next player at 1
     */
    getSurroundingPlayersIds(player) {
        let playerIndex = this.gamedatas.playerorder.indexOf(player.id); //playerorder is a mixed types array
        if (playerIndex == -1)
            playerIndex = this.gamedatas.playerorder.indexOf(player.id);
        const previousId = playerIndex - 1 < 0
            ? this.gamedatas.playerorder[this.gamedatas.playerorder.length - 1]
            : this.gamedatas.playerorder[playerIndex - 1];
        const nextId = playerIndex + 1 >= this.gamedatas.playerorder.length
            ? this.gamedatas.playerorder[0]
            : this.gamedatas.playerorder[playerIndex + 1];
        return [previousId, nextId];
    }
    addArrowsToActivePlayer(state) {
        const notUsefulStates = ['todo'];
        if (state.type === 'activeplayer' &&
            state.active_player !== this.player_id &&
            !notUsefulStates.includes(state.name)) {
            if (!$('goToCurrentPlayer')) {
                dojo.place(`
                    <div id="goToCurrentPlayer" class="show-player-tableau">
                        <a href="#anchor-player-${state.active_player}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.333343 145.79321">
                                <path fill="currentColor" d="M 1.6,144.19321 C 0.72,143.31321 0,141.90343 0,141.06039 0,140.21734 5.019,125.35234 11.15333,108.02704 L 22.30665,76.526514 14.626511,68.826524 C 8.70498,62.889705 6.45637,59.468243 4.80652,53.884537 0.057,37.810464 3.28288,23.775161 14.266011,12.727735 23.2699,3.6711383 31.24961,0.09115725 42.633001,0.00129225 c 15.633879,-0.123414 29.7242,8.60107205 36.66277,22.70098475 8.00349,16.263927 4.02641,36.419057 -9.54327,48.363567 l -6.09937,5.36888 10.8401,30.526466 c 5.96206,16.78955 10.84011,32.03102 10.84011,33.86992 0,1.8389 -0.94908,3.70766 -2.10905,4.15278 -1.15998,0.44513 -19.63998,0.80932 -41.06667,0.80932 -28.52259,0 -39.386191,-0.42858 -40.557621,-1.6 z M 58.000011,54.483815 c 3.66666,-1.775301 9.06666,-5.706124 11.99999,-8.735161 l 5.33334,-5.507342 -6.66667,-6.09345 C 59.791321,26.035633 53.218971,23.191944 43.2618,23.15582 33.50202,23.12041 24.44122,27.164681 16.83985,34.94919 c -4.926849,5.045548 -5.023849,5.323672 -2.956989,8.478106 3.741259,5.709878 15.032709,12.667218 24.11715,14.860013 4.67992,1.129637 13.130429,-0.477436 20,-3.803494 z m -22.33337,-2.130758 c -2.8907,-1.683676 -6.3333,-8.148479 -6.3333,-11.893186 0,-11.58942 14.57544,-17.629692 22.76923,-9.435897 8.41012,8.410121 2.7035,22.821681 -9,22.728685 -2.80641,-0.0223 -6.15258,-0.652121 -7.43593,-1.399602 z m 14.6667,-6.075289 c 3.72801,-4.100734 3.78941,-7.121364 0.23656,-11.638085 -2.025061,-2.574448 -3.9845,-3.513145 -7.33333,-3.513145 -10.93129,0 -13.70837,13.126529 -3.90323,18.44946 3.50764,1.904196 7.30574,0.765377 11,-3.29823 z m -11.36999,0.106494 c -3.74071,-2.620092 -4.07008,-7.297494 -0.44716,-6.350078 3.2022,0.837394 4.87543,-1.760912 2.76868,-4.29939 -1.34051,-1.615208 -1.02878,-1.94159 1.85447,-1.94159 4.67573,0 8.31873,5.36324 6.2582,9.213366 -1.21644,2.27295 -5.30653,5.453301 -7.0132,5.453301 -0.25171,0 -1.79115,-0.934022 -3.42099,-2.075605 z"></path>
                            </svg>
                        </a>
                    </div>
                    `, 'generalactions', 'last');
            }
            if (!$('goBackUp')) {
                dojo.place(`
                    <div id="goBackUp" class="show-player-tableau">
                        <a href="#">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1280.000000pt" height="1280.000000pt" viewBox="0 0 1280.000000 1280.000000" preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                                fill="currentColor" stroke="none">
                                <path d="M6305 12787 c-74 -19 -152 -65 -197 -117 -30 -34 -786 -1537 -3070
                                -6105 -2924 -5849 -3029 -6062 -3035 -6126 -15 -173 76 -326 237 -403 59 -27
                                74 -30 160 -30 79 1 104 5 150 26 30 13 1359 894 2953 1956 l2897 1932 2897
                                -1932 c1594 -1062 2923 -1943 2953 -1957 47 -21 70 -25 150 -25 86 0 101 3
                                160 30 36 17 86 50 111 72 88 79 140 223 124 347 -6 51 -383 811 -3040 6125
                                -2901 5801 -3036 6069 -3082 6110 -100 90 -246 128 -368 97z"/>
                                </g>
                            </svg>
                        </a>
                    </div>
                    `, 'generalactions', 'last');
            }
        }
    }
    /** Tells if seasons custom sounds are active in user prefs. */
    isCustomSoundsOn() {
        return this.gameui.prefs[1].value == 1;
    }
    /*
     * Play a given sound that should be first added in the tpl file
     */
    playCustomSound(sound, playNextMoveSound = true) {
        if (this.isCustomSoundsOn()) {
            this.gameui.sounds.play(sound);
            playNextMoveSound && this.gameui.disableNextMoveSound();
        }
    }
    /**
     * This method can be used instead of addActionButton, to add a button which is an image (i.e. resource). Can be useful when player
     * need to make a choice of resources or tokens.
     */
    addImageActionButton(id, content, color = 'primary', tooltip, handler, parentClass = '') {
        // this will actually make a transparent button
        const btn = this.statusBar.addActionButton(content, handler, {
            id: id,
            color: color,
            title: tooltip,
            classes: 'shadow bgaimagebutton ' + parentClass
        });
        // remove boarder, for images it better without
        dojo.style(btn, 'border', 'none');
        return btn;
    }
    /**
     * Update player score.
     */
    notif_points(notif) {
        this.setPoints(notif.args.playerId, notif.args.points);
    }
    notif_updateCounters(notif) {
        this.safeUpdateCounters(notif.args.counters);
    }
    safeUpdateCounters(counters) {
        const existingCounters = Object.keys(counters).filter((c) => $(c) != undefined);
        this.gameui.updateCounters(Object.fromEntries(existingCounters.map((key) => [key, counters[key]])));
        const notExistingCounters = Object.keys(counters).filter((c) => $(c) == undefined);
        this.updateCustomCounters(Object.fromEntries(notExistingCounters.map((key) => [key, counters[key]])));
    }
    updateCustomCounters(counters) {
        //to redefine in subclass
    }
    /**
     * Update player score.
     */
    setPoints(playerId, points) {
        var _a;
        (_a = this.gameui.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(points);
    }
    /**
     * Show last turn banner.
     */
    notif_lastTurn(animate = true) {
        if (!$('last-round')) {
            dojo.place(`<div id="last-round">
					<span class="last-round-text ${animate ? 'animate' : ''}">${_('Finishing round before end of game!')}</span>
				</div>`, 'page-title');
        }
    }
    /**
     * Show important message banner.
     */
    notif_importantMessage(notif, animate = true) {
        let msgClass = '';
        switch (notif.args.type) {
            case 'POSITIVE':
                msgClass = 'important-msg-positive';
                break;
            case 'NEGATIVE':
                msgClass = 'important-msg-negative';
                break;
            case 'WARNING':
                msgClass = 'important-msg-warning';
                break;
        }
        dojo.place(`<div id="important-message" class="${msgClass}">
				<span class="important-message-text ${animate ? 'animate' : ''}">${this.gameui.format_string_recursive(notif.args.message, notif.args)}</span>
			</div>`, 'page-title');
        if (notif.args.temporary) {
            this.gameui.fadeOutAndDestroy('important-message', 4000);
        }
    }
    destroyImportantMessage() {
        if ($('important-message'))
            this.gameui.fadeOutAndDestroy('important-message', 300);
    }
    takeAction(action, data, options) {
        data = data || {};
        data.version = this.gamedatas.version;
        return this.gameui.bgaPerformAction(action, data, options);
    }
    setTooltip(id, html) {
        this.gameui.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    setTooltipToClass(className, html) {
        this.gameui.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }
    toggleActionButtonVisibility(buttonId, visible) {
        if ($(buttonId)) {
            dojo.toggleClass(buttonId, 'hidden-important', !visible);
        }
    }
    /**
     * Pass (in case of no possible action).
     */
    pass() {
        this.takeAction('actPass');
    }
    isFastMode() {
        return this.gameui.instantaneousMode;
    }
    positionObjectDirectly(mobileObj, x, y) {
        // do not remove this "dead" code some-how it makes difference
        dojo.style(mobileObj, 'left'); // bug? re-compute style
        // console.log("place " + x + "," + y);
        dojo.style(mobileObj, {
            left: x + 'px',
            top: y + 'px'
        });
        dojo.style(mobileObj, 'left'); // bug? re-compute style
    }
    getPlayersInOrder() {
        return Object.values(this.gamedatas.playerOrderWorkingWithSpectators).map((p) => this.gamedatas.players[Number(p)]);
    }
    /**
     * Adds a button with each player name except for the current player
     * @param buttonHandler what to do when one of the buttons is clicked
     */
    addPlayerNameButtons(buttonHandler) {
        Object.values(this.gamedatas.players).forEach((p) => {
            var _a;
            if (Number(p.id) != this.getPlayerId()) {
                this.statusBar.addActionButton((_a = this.gamedatas.players[p.id]) === null || _a === void 0 ? void 0 : _a.name, function () {
                    buttonHandler(p);
                }, { id: `choose_player_button_${p.id}` });
            }
        });
    }
    addTimerButton(buttonId, buttonText = _('Confirm'), activateCondition, confirmFunction, cancelButtonText, cancelFunction) {
        //this.stopActionTimer();
        if (activateCondition) {
            this.statusBar.addActionButton(buttonText, () => {
                dojo.destroy(buttonId);
                confirmFunction();
            }, { id: buttonId, classes: 'timer-button' });
            this.startActionTimer(buttonId, isDebug ? 2 : ACTION_TIMER_DURATION, cancelButtonText, () => {
                dojo.destroy(buttonId);
                cancelFunction();
            });
        }
        else {
            this.stopActionTimer();
        }
    }
    /**
     * Handle user preferences changes.
     */
    setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
            const match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            let prefId = +match[1];
            let prefValue = +e.target.value;
            this.gameui.prefs[prefId].value = prefValue;
            this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query('.preference_control').connect('onchange', onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query('#ingame_menu_content .preference_control'), (el) => onchange({ target: el }));
    }
    /**
     * Handle user preferences changes.
     */
    onPreferenceChange(prefId, prefValue) {
        log('onPreferenceChange', prefId, '=>', prefValue);
        switch (prefId) {
        }
    }
    /**
     * Timer for Confirm button. Also adds a cancel button to stop timer.
     * Cancel actions can be passed to be executed on cancel button click.
     */
    startActionTimer(buttonId, time, cancelButtonLabel = _('Cancel'), cancelFunction) {
        if (this.actionTimerId) {
            window.clearInterval(this.actionTimerId);
            dojo.query('.timer-button').forEach((but) => (but.innerHTML = this.stripTime(but.innerHTML)));
            dojo.destroy(`cancel-button`);
        }
        //adds cancel button
        const button = document.getElementById(buttonId);
        this.statusBar.addActionButton(cancelButtonLabel, () => {
            window.clearInterval(this.actionTimerId);
            button.innerHTML = this.stripTime(button.innerHTML);
            cancelFunction === null || cancelFunction === void 0 ? void 0 : cancelFunction();
            dojo.destroy(`cancel-button`);
        }, { id: `cancel-button`, color: 'alert' });
        const _actionTimerLabel = button.innerHTML;
        let _actionTimerSeconds = time;
        const actionTimerFunction = () => {
            const button = document.getElementById(buttonId);
            if (button == null) {
                window.clearInterval(this.actionTimerId);
            }
            else if (button.classList.contains('disabled')) {
                window.clearInterval(this.actionTimerId);
                button.innerHTML = this.stripTime(button.innerHTML);
            }
            else if (_actionTimerSeconds-- > 1) {
                button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
                if (_actionTimerSeconds < 5 && !button.classList.contains('shake-bottom-infinite')) {
                    button.classList.add('shake-bottom-infinite');
                }
            }
            else {
                window.clearInterval(this.actionTimerId);
                button.click();
                button.innerHTML = this.stripTime(button.innerHTML);
            }
        };
        actionTimerFunction();
        this.actionTimerId = window.setInterval(() => actionTimerFunction(), 1000);
    }
    stopActionTimer() {
        if (this.actionTimerId) {
            window.clearInterval(this.actionTimerId);
            dojo.query('.timer-button').forEach((but) => dojo.destroy(but.id));
            dojo.destroy(`cancel-button`);
            this.actionTimerId = undefined;
        }
    }
    stripTime(buttonLabel) {
        const regex = /\s*\([0-9]+\)$/;
        return buttonLabel.replace(regex, '');
    }
}
function addTemporaryClass(element, className, removalDelay) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (!el)
        return;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), removalDelay);
}
function removeClass(className, rootNode) {
    if (!rootNode)
        rootNode = document;
    else
        rootNode = rootNode;
    rootNode.querySelectorAll('.' + className).forEach((item) => item.classList.remove(className));
}
function queryFirst(query) {
    return document.querySelector(query);
}
function queryFirstId(query, defaultValue = undefined) {
    var res = document.querySelector(query);
    if (!res)
        return defaultValue;
    return res.id;
}
/*
 * Detect if spectator or replay
 */
function isReadOnly() {
    return this.isSpectator || typeof this.gameui.g_replayFrom != 'undefined' || this.gameui.g_archive_mode;
}
/**
 * @returns true for instant replay (during game) or archive mode (after game end)
 */
function isAnyTypeOfReplay() {
    return typeof this.gameui.g_replayFrom != 'undefined' || this.gameui.g_archive_mode;
}
function getPart(haystack, i, noException = false, separator = '-') {
    const parts = haystack.split(separator);
    const len = parts.length;
    if (noException && i >= len) {
        return '';
    }
    if (noException && len + i < 0) {
        return '';
    }
    return parts[i >= 0 ? i : len + i];
}
function replaceStarScoreIcon(newClass) {
    dojo.query('.fa-star')
        .removeClass('fa fa-star')
        .addClass(newClass)
        .style({ 'vertical-align': 'middle', 'display': 'inline-block' });
}
function createDiv(classes, id = '', value = '') {
    if (typeof value == 'undefined')
        value = '';
    const node = dojo.create('div', { class: classes, innerHTML: value });
    if (id)
        node.id = id;
    return node.outerHTML;
}
function groupBy(arr, fn) {
    return arr.reduce((prev, curr) => {
        const groupKey = fn(curr);
        const group = prev[groupKey] || [];
        group.push(curr);
        return Object.assign(Object.assign({}, prev), { [groupKey]: group });
    }, {});
}
/**
 * End score board.
 * No notifications.
 */
class ScoreBoard {
    constructor(game, players) {
        this.game = game;
        this.players = players;
        const headers = document.getElementById('scoretr');
        if (!headers.childElementCount) {
            headers.insertAdjacentHTML('afterbegin', `
                <th></th>
                <th id="th-destination-reached-score" class="">${_('Destinations reached')}</th>
                <th id="th-revealed-tokens-back-score" class="">${_('Revealed destinations reached')}</th>
                <th id="th-destination-unreached-score" class="">${_('Destinations not reached')}</th>
                <th id="th-total-score" class="total-score">${_('Total')}</th>
            `);
        }
        players.forEach((player) => {
            const playerId = Number(player.id);
            /*dojo.place(
                `<tr id="score${player.id}">
                    <td id="score-name-${player.id}" class="player-name" style="color: #${
                    player.color
                }"><span id="score-winner-${player.id}"/> <span>${player.name}</span></td>
                    <td id="destination-reached${player.id}" class="score-number">${
                    player.completedDestinations.length + player.sharedCompletedDestinationsCount
                }</td>
                    <td id="revealed-tokens-back${player.id}" class="score-number">${
                    player.revealedTokensBackCount
                }</td>
                    <td id="destination-unreached${player.id}" class="score-number">${this.preventMinusZero(
                    player.uncompletedDestinations?.length
                )}</td>
                    <td id="revealed-tokens-left${player.id}" class="score-number">${this.preventMinusZero(
                    player.revealedTokensLeftCount
                )}</td>
                    <td id="total${player.id}" class="score-number total">${player.score}</td>
                </tr>`,
                "score-table-body"
            );*/
        });
    }
    updateScores(players) {
        /*players.forEach((p) => {
            document.getElementById(`destination-reached${p.id}`).innerHTML = (
                p.completedDestinations.length + p.sharedCompletedDestinationsCount
            ).toString();
            document.getElementById(`revealed-tokens-back${p.id}`).innerHTML = p.revealedTokensBackCount.toString();
            document.getElementById(`destination-unreached${p.id}`).innerHTML = this.preventMinusZero(
                p.uncompletedDestinations?.length
            );
            document.getElementById(`revealed-tokens-left${p.id}`).innerHTML = this.preventMinusZero(
                p.revealedTokensLeftCount
            );
            document.getElementById(`total${p.id}`).innerHTML = p.score.toString();
        });*/
    }
    preventMinusZero(score) {
        if (score === 0) {
            return '0';
        }
        return '-' + score.toString();
    }
    updateScore(playerId, scoreType, score, animate = true) {
        let elt = dojo.byId(scoreType);
        if (!elt) {
            const playerVariant = `${scoreType}-${playerId}`;
            elt = dojo.byId(playerVariant);
            scoreType = playerVariant;
        }
        if (!elt) {
            console.error('updateScore : this element can not be displayed', scoreType);
        }
        else {
            elt.innerHTML = score.toString();
            if (animate) {
                dojo.addClass(scoreType, 'animatedScore');
            }
        }
    }
    /**
     * Add trophee icon to top score player(s)
     */
    highlightWinnerScore(playerId) {
        document.getElementById(`score${playerId}`).classList.add('highlight');
        document.getElementById(`score-winner-${playerId}`).classList.add('fa', 'fa-trophy', 'fa-lg');
    }
}
/**
 * Player table.
 */
class PlayerTable {
    constructor(game, player, cards) {
        this.game = game;
        const isMyTable = player.id === game.getPlayerId();
        const ownClass = isMyTable ? 'own' : '';
        let html = `
			<a id="anchor-player-${player.id}"></a>
            <div id="player-table-${player.id}" class="player-order${player.playerNo} player-table ${ownClass}">
				<span class="player-name" style="color:#${player.color}">${player.name}</span>
            </div>
        `;
        dojo.place(html, 'player-tables');
        if (isMyTable) {
            const handHtml = `
			<div id="hand-${player.id}" class="cstm-player-hand"></div>
        `;
            dojo.place(handHtml, `player-table-${player.id}`, 'first');
            this.initHand(player, cards);
        }
    }
    initHand(player, cards = []) {
        this.handStock = new BgaCards.LineStock(this.game.cardsManager, $('hand-' + player.id), {});
        this.handStock.setSelectionMode('single');
        if (cards) {
            this.handStock.addCards(cards);
        }
    }
}
class Setting {
    constructor(name, type, prefId) {
        this.name = name;
        this.type = type;
        this.prefId = prefId;
    }
}
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TheIsleOfCatsDuel implementation : © Séverine Kamycki <mizutismask@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * theisleofcatsduel.ts
 *
 * TheIsleOfCatsDuel user interface script
 *
 * In this file, you are describing the logic of your user interface, in Typescript language.
 *
 */
class TheIsleOfCatsDuel extends BaseGame {
    constructor() {
        super(...arguments);
        this.ticketsCounters = [];
        this.handCardsCounters = [];
        this.settings = [new Setting('customSounds', 'pref', 1)];
    }
    /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
    setup(gamedatas) {
        log('Starting game setup');
        this.gameui = gameui;
        this.dontPreloadUselessAssets();
        this.customSounds.forEach((sound) => {
            this.gameui.sounds.load(sound, sound);
        });
        this.includeHtmlBasicTemplate();
        log('gamedatas', gamedatas);
        this.animationManager = new BgaAnimations.Manager({
            animationsActive: () => this.gameui.bgaAnimationsActive()
        });
        this.cardsManager = new CardsManager(this);
        if (gamedatas.lastTurn) {
            this.notif_lastTurn(false);
        }
        if (Number(gamedatas.gamestate.id) >= 90) {
            // score or end
            this.onEnteringEndScore();
        }
        this.gameui.getGameAreaElement().insertAdjacentHTML('beforeend', `<div id="boat-choice">
                <div class="boat IBoat"></div>
                <div class="boat OBoat"></div>
                </div>`);
        // Example to add a div on the game area
        this.gameui.getGameAreaElement().insertAdjacentHTML('beforeend', `
                <div id="player-tables"></div>
            `);
        // Setting up player boards
        Object.values(this.gamedatas.players).forEach((player) => {
            // example of setting up players boards
            this.gameui.getPlayerPanelElement(player.id).insertAdjacentHTML('beforeend', `
                    <span id="fish-player-counter-${player.id}"></span> Fishes
                `);
            const counter = new ebg.counter();
            counter.create(`fish-player-counter-${player.id}`, {
                value: player.fish,
                playerCounter: 'fish',
                playerId: player.id
            });
            // example of adding a div for each player
            document.getElementById('player-tables').insertAdjacentHTML('beforeend', `
                    <div id="player-table-${player.id}">
                        <strong>${player.name}</strong>
                        <div>Player zone content goes here</div>
                    </div>
                `);
        });
        Object.values(this.gamedatas.playerOrderWorkingWithSpectators).forEach((p) => {
            //this.setupPlayer(this.gamedatas.players[p])
        });
        //;(this.gameui as any).updateCounters(this.gamedatas.counters)
        $('overall-content').classList.add(`player-count-${this.getPlayersCount()}`);
        this.setupPreferences();
        this.setupTooltips();
        this.setupHelpPopin();
        /*this.scoreBoard = new ScoreBoard(this, this.getPlayersInOrder())
        this.gamedatas.scores?.forEach((s) => this.scoreBoard.updateScore(s.playerId, s.scoreType, s.score))
        if (this.gamedatas.winners) {
            this.gamedatas.winners.forEach((pId) => this.scoreBoard.highlightWinnerScore(pId))
        }*/
        removeClass('animatedScore');
        this.setupNotifications();
        BgaAutofit.init();
        log('Ending game setup');
    }
    setupTooltips() {
        //todo change counter names
        this.setTooltipToClass('revealed-tokens-back-counter', _('counter1 tooltip'));
        this.setTooltipToClass('tickets-counter', _('counter2 tooltip'));
        this.setTooltipToClass('hand-cards-counter', _('Cards in hand'));
        this.setTooltipToClass('deck-cards-counter', _('Cards in deck'));
        this.setTooltipToClass('cstm-help-icon', `<div class="help-card recto"></div>`);
        this.setTooltipToClass('cstm-help-icon-mini', `<div class="help-card verso"></div>`);
        this.setTooltipToClass('player-turn-order', _('First player'));
    }
    setupPlayer(player) {
        document.getElementById(`overall_player_board_${player.id}`).dataset.playerColor = player.color;
        this.setupMiniPlayerBoard(player);
        this.playerTables[player.id] = new PlayerTable(this, player, Number(player.id) === this.getPlayerId() ? this.gamedatas.hand : []);
    }
    setupMiniPlayerBoard(player) {
        const playerId = Number(player.id);
        this.gameui.getPlayerPanelElement(playerId).insertAdjacentHTML('afterbegin', `<div id="counters-${player.id}" class="counters">
				<div id="tickets-counter-${player.id}-wrapper" class="counter tickets-counter">
					<div class="icon expTicket"></div> 
					<span id="tickets-player-counter-${player.id}"></span>
				</div>
			
				<div id="hand-cards-counter-${player.id}-wrapper" class="counter hand-cards-counter counter-left-part">
					<div class="fa fa-hand-paper-o"></div> 
					<span id="hand-cards-counter-${player.id}"></span>
				</div>
			</div>
			<div id="additional-info-${player.id}" class="counters additional-info">
				<div id="additional-icons-${player.id}" class="additional-icons"></div> 
			</div>
			`);
        /* const revealedTokensBackCounter = new ebg.counter();
            revealedTokensBackCounter.create(`revealed-tokens-back-counter-${player.id}`);
            revealedTokensBackCounter.setValue(player.revealedTokensBackCount);
            this.revealedTokensBackCounters[playerId] = revealedTokensBackCounter;
*/
        const ticketsCounter = new ebg.counter();
        ticketsCounter.create(`tickets-player-counter-${player.id}`, {
            value: player.tickets,
            playerCounter: 'tickets',
            playerId: playerId
        });
        this.ticketsCounters[playerId] = ticketsCounter;
        const cardsCounter = new ebg.counter();
        cardsCounter.create(`hand-cards-counter-${player.id}`);
        cardsCounter.setValue(player.cardsCount);
        this.handCardsCounters[playerId] = cardsCounter;
    }
    setupHelpPopin() {
        var _a, _b;
        new HelpManager(this, {
            buttons: [
                new BgaHelpPopinButton({
                    title: _('Roles in play'),
                    html: this.getHelpHtml(),
                    buttonBackground: 'white',
                    buttonColor: '#266059'
                }),
                new BgaHelpExpandableButton({
                    unfoldedHtml: `<div id="player-help-visible-wrapper" >
										<div id="player-help-visible" class="player-help-visible" style="margin: 5px;" data-player-color="${(_b = (_a = this.getCurrentPlayer()) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : 'fff'}"></div>
									</div>`,
                    //foldedHtml: `?`,
                    expandedWidth: '250px',
                    expandedHeight: '182px',
                    expandedRadius: '3%',
                    foldedContentExtraClasses: 'button-help-expandable'
                })
            ]
        });
    }
    getHelpHtml() {
        let html = `
        <div id="help-popin"> `;
        /*new Set(this.gamedatas.rolesInPlay).forEach((r) => {
            html += this.getRoleHtml(r, this.gamedatas.rolesInPlay.filter((allR) => allR === r).length)
        })*/
        html += `
        </div>
        `;
        return html;
    }
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    bgaFormatText(log, args) {
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                ['gemType'].forEach((field) => {
                    if (typeof args[field] === 'number') {
                        args[field] = `<span class="log-icon gem gem-${args[field]}"></span>`;
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return { log, args };
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
        log('Entering state: ' + stateName, args);
        switch (stateName) {
            case 'chooseAction':
                if (args === null || args === void 0 ? void 0 : args.args) {
                    const dataArgs = args.args;
                    this.onEnteringChooseAction(dataArgs);
                }
                break;
            case 'endScore':
                this.onEnteringEndScore();
                break;
        }
    }
    onEnteringChooseAction(args) {
        //todo
        if (this.gameui.isCurrentPlayerActive()) {
            this.resetClientActionData();
            const actions = this.getPossibleActions(args);
            this.setChooseActionGamestateDescription(actions.join(_(' or ')));
        }
        //this.missions.addCards(args._private.missions).then(()=>this.missions.setSelectableCards(args._private.choosableMissions))
    }
    getPossibleActions(args) {
        const actions = [];
        //if (args.canBuild) actions.push(_('Build your mall'))
        //if (args.canTakeMoney) actions.push(_('Take money from the dispenser'))
        if (actions.length === 0) {
            actions.push(_('No possible action left'));
        }
        return actions;
    }
    /**
     * Show score board.
     */
    onEnteringEndScore() {
        const lastTurnBar = document.getElementById('last-round');
        if (lastTurnBar) {
            lastTurnBar.style.display = 'none';
        }
    }
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState(stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            /* Example:
        
        case 'myGameState':
        
            // Hide the HTML block we are displaying only during this game state
            dojo.style( 'my_html_block_id', 'display', 'none' );
            
            break;
        */
            case 'dummmy':
                break;
        }
    }
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons(stateName, args) {
        log('onUpdateActionButtons: ' + stateName, args);
        if (this.gameui.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'chooseAction':
                    this.statusBar.addActionButton(_('Validate'), () => this.selectInSetAction(), {
                        id: 'btn-validate'
                    });
                    this.toggleActionButtonVisibility('btn-validate', false);
                    this.setActionBarChooseAction(false);
                    break;
                case 'BoatChoice':
                    this.statusBar.addActionButton(_('Choose the first boat'), () => this.takeAction('actChooseBoat', { boat: 'OBoat' }), {});
                    this.statusBar.addActionButton(_('Choose the second boat'), () => this.takeAction('actChooseBoat', { boat: 'IBoat' }), {});
                    break;
                case 'PlayerTurn':
                /*const playableCardsIds = args.playableCardsIds // returned by the argPlayerTurn

                        // Add test action buttons in the action status bar, simulating a card click:
                        playableCardsIds.forEach((cardId) =>
                            this.statusBar.addActionButton(
                                _('Play card with id ${card_id}').replace('${card_id}', cardId),
                                () => this.onCardClick(cardId)
                            )
                        )

                        this.statusBar.addActionButton(_('Pass'), () => this.bgaPerformAction('actPass'), {
                            color: 'secondary'
                        })
                        break*/
            }
        }
    }
    selectInSetAction() {
        /*
        if (this.playerSet.getSelection().length == 5) {
            this.takeAction('actSelectInSet', {
                cardIds: this.getSelectedIdsAsParam(this.playerSet)
            })
        } else {
            ;this.gameui.showMessage(_('You have to select 5 cards'), 'error')
        }
        */
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    getSelectedIdsAsParam(stock) {
        return stock
            .getSelection()
            .map((c) => c.id)
            .join(',');
    }
    isRealTime() {
        return this.gameui.bRealtime;
    }
    closeCurrentTooltip() {
        if (this.displayedTooltip == null)
            return;
        else {
            this.displayedTooltip.close();
            this.displayedTooltip = null;
        }
    }
    addTooltipOnClickHelpButton(id, html, delay) {
        /*let tooltip = new dijit.Tooltip({
            label: html,
            showDelay: delay
        })

        dojo.connect($(id), 'click', (evt) => {
            evt.stopPropagation()

            if (tooltip.state == 'SHOWING') {
                this.closeCurrentTooltip()
            } else {
                this.closeCurrentTooltip()
                tooltip.open($(id))
                this.displayedTooltip = tooltip
            }
        })

        dojo.connect($(id), 'mouseleave', () => {
            tooltip.close()
        })*/
    }
    dontPreloadUselessAssets() {
        if (this.getPlayersCount() == 1) {
            //;this.gameui.dontPreloadImage('centralBoard.png')//TODO
        }
        else {
            //;this.gameui.dontPreloadImage('centralBoardSolo.png')
        }
    }
    toggleActionButtonAbility(buttonId, enable, autoClickIfEnabled = undefined) {
        if (autoClickIfEnabled == undefined) {
            //autoClickIfEnabled= this.isConfirmOnlyOnPlacingTokensOn()
        }
        dojo.toggleClass(buttonId, 'disabled', !enable);
        if (autoClickIfEnabled && !dojo.hasClass(buttonId, 'disabled')) {
            $(buttonId).click();
        }
    }
    /** Tells if confirm is active in user prefs. */
    isConfirmOnlyOnPlacingTokensOn() {
        //return this.gameui.prefs[2].value == 1
        return true;
    }
    resetClientActionData() {
        this.clientActionData = {
            placedCardId: undefined,
            destinationSquare: undefined,
            previousCardParentInHand: undefined
        };
    }
    setChooseActionGamestateDescription(newText) {
        if (!this.originalTextChooseAction) {
            this.originalTextChooseAction = document.getElementById('pagemaintitletext').innerHTML;
        }
        this.gameui.statusBar.setTitle(newText !== null && newText !== void 0 ? newText : this.originalTextChooseAction);
    }
    /**
     * Sets the action bar (title and buttons) for Choose action.
     */
    setActionBarChooseAction(fromCancel) {
        document.getElementById(`generalactions`).innerHTML = '';
        if (fromCancel) {
            this.setChooseActionGamestateDescription();
        }
        if (this.actionTimerId) {
            window.clearInterval(this.actionTimerId);
        }
        const chooseActionArgs = this.gamedatas.gamestate.args;
        this.addImageActionButton('useTicket_button', createDiv('expTicket', 'expTicket-button'), 'primary', _('Use a ticket to place another arrow, remove the last one of any expedition or exchange a card'), () => {
            // this.useTicket();
        });
        $('expTicket-button').parentElement.style.padding = '0';
        //{autoclick: true}
        //dojo.toggleClass('useTicket_button', 'disabled', !chooseActionArgs.canUseTicket);
        if (chooseActionArgs.canPass) {
            this.statusBar.addActionButton(_('End my turn'), () => this.pass());
        }
        if (chooseActionArgs.canResetTurn) {
            this.statusBar.addActionButton(_('Reset my turn'), () => this.takeAction('actResetPlayerTurn'), {
                color: 'alert',
                title: _('Reset your entire round')
            });
        }
    }
    handSelectionChange(selection, lastChange) {
        if (this.gameui.isCurrentPlayerActive()) {
            this.toggleActionButtonVisibility('btn-validate', selection.length > 0);
        }
    }
    ///////////////////////////////////////////////////
    //// Player's action
    /*
    
        Here, you are defining methods to handle player's action (ex: results of mouse click on
        game objects).
        
        Most of the time, these methods:
        _ check the action is possible at this game state.
        _ make a call to the game server
    
    */
    ensureStockSelection(stocks, errorMsg, callback) {
        if (stocks.every((s) => s.getSelection().length > 0)) {
            callback();
        }
        else {
            this.gameui.showMessage(errorMsg, 'error');
        }
    }
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your theisleofcatsduel.game.php file.
    
    */
    setupNotifications() {
        log('notifications subscriptions setup');
        // TODO: here, associate your game notifications with local methods
        // Example 1: standard notification handling
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // Example 2: standard notification handling + tell the user interface to wait
        //            during 3 seconds after calling the method in order to let the players
        //            see what is happening in the game.
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
        //
        const notifs = [
            ['points', 1],
            ['score', ANIMATION_MS],
            ['highlightWinnerScore', ANIMATION_MS],
            ['materialMove', ANIMATION_MS],
            ['lastTurn', 1],
            ['importantMessage', 3000],
            ['counter', 1],
            ['updateCounters', 1]
        ];
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            this.gameui.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }
    /**
     * Updates a total or subtotal
     * @param notif
     */
    notif_score(notif) {
        log('notif_score', notif);
        this.scoreBoard.updateScore(notif.args.playerId, notif.args.scoreType, notif.args.score);
    }
    notif_counter(notif) {
        if (notif.args.counterName == 'empty-hexes') {
            //this.emptyHexesCounters[notif.args.playerId].setValue(notif.args.counterValue)
        }
    }
    notif_materialMove(notif) {
        log('notif_materialMove', notif);
        /*switch (notif.args.type) {
            case "MISSION":
                const cards = notif.args.material as Array<MissionCard>
                this.notif_missionMove(cards, notif)
                break
            default:
                console.error('Material type move not handled', notif)
                break
        }*/
    }
    /* notif_missionMove(cards: MissionCard[], notif: Notif<NotifMaterialMove>) {
        const card = cards.at(0)
        switch (notif.args.to) {
            case "DISCARD":
                if (notif.args.fromArg == notif.args.toArg) {
                    this.festivalStocks[notif.args.toArg].flipCard(card)
                    if (notif.args?.soldOut) this.playCustomSound('clap', false)
                } else {
                    this.festivalStocks[notif.args.toArg].addCard(card)
                }
                break

            default:
                console.error('Festival move destination not handled', notif)
                break
        }
    }*/
    /**
     * Highlight winner for end score.
     */
    notif_highlightWinnerScore(notif) {
        var _a;
        (_a = this.scoreBoard) === null || _a === void 0 ? void 0 : _a.highlightWinnerScore(notif.args.playerId);
    }
}
const wrapper = {
    constructor: function () {
        this.theisleofcatsduel = new TheIsleOfCatsDuel();
    },
    onGameUserPreferenceChanged: function (prefId, prefValue) {
        var _a, _b;
        (_b = (_a = this.theisleofcatsduel).onGameUserPreferenceChanged) === null || _b === void 0 ? void 0 : _b.call(_a, prefId, prefValue);
    },
    setup: function (gamedatas) {
        this.gamedatas = gamedatas;
        this.theisleofcatsduel.setup(gamedatas);
    },
    onEnteringState: function (stateName, args) {
        this.theisleofcatsduel.onEnteringState(stateName, args);
    },
    onLeavingState: function (stateName) {
        this.theisleofcatsduel.onLeavingState(stateName);
    },
    onUpdateActionButtons(stateName, args) {
        this.theisleofcatsduel.onUpdateActionButtons(stateName, args);
    },
    setupNotifications() {
        this.theisleofcatsduel.setupNotifications();
    },
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    format_string_recursive(log, args) {
        const { log: updatedLog, args: updatedArgs } = this.theisleofcatsduel.bgaFormatText(log, args);
        log = updatedLog;
        args = updatedArgs;
        return this.inherited(arguments);
    }
};
return declare("bgagame.theisleofcatsduel", ebg.core.gamegui, wrapper);
});
