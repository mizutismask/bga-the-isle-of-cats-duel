
 class IslandMgr {
  private game: TheIsleOfCatsDuelGame;
  private rootSel: string;
  private clickableCls = 'tioc-clickable';
  /** Guard stacks for treasure allowances (so we can undo) */
  private allowCommonCount = 0;
  private allowSmallCount = 0;
  private allowRareCount = 0;

  constructor(game: TheIsleOfCatsDuelGame, rootSel = '#tioc-island') {
    this.game = game;
    this.rootSel = rootSel;
  }

  /** Let player pick a cat tile from the island; calls back with shapeId and price. */
  allowRescueCat = (cb: (shapeId: string, price: number) => void): void => {
    const root = document.querySelector(this.rootSel);
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.shape.cat').forEach((el) => {
      el.classList.add(this.clickableCls);
      this.game.addOnClick(el, (ev) => {
        ev.preventDefault();
        const shapeId = el.id;
        const price = Number(el.dataset.price || 0);
        this.removeAllIslandClickable();
        cb(shapeId, price);
      });
    });
  };

  /** Let player pick an oshax tile. */
  allowRescueOshax = (cb: (shapeId: string) => void): void => {
    const root = document.querySelector(this.rootSel);
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.shape.oshax').forEach((el) => {
      el.classList.add(this.clickableCls);
      this.game.addOnClick(el, (ev) => {
        ev.preventDefault();
        const shapeId = el.id;
        this.removeAllIslandClickable();
        cb(shapeId);
      });
    });
  };

  /** Allow taking a common treasure; we simply enable clicks on treasure shapes. */
  allowTakeCommonTreasure = (doFct?: () => void, _undoFct?: () => void): void => {
    this.allowCommonCount++;
    doFct?.();
    this._enableTreasureClicks('.shape.treasure.common');
  };

  allowTakeSmallTreasure = (): void => {
    this.allowSmallCount++;
    this._enableTreasureClicks('.shape.treasure.small');
  };

  allowTakeRareTreasure = (): void => {
    this.allowRareCount++;
    this._enableTreasureClicks('.shape.treasure.rare');
  };

  /** Remove all island clickables. */
  removeAllIslandClickable = (): void => {
    document.querySelectorAll(`.${this.clickableCls}`).forEach((el) => el.classList.remove(this.clickableCls));
  };

  /** Checks for stock on the island. */
  hasCommonTreasure = (): boolean => !!document.querySelector(`${this.rootSel} .shape.treasure.common`);
  hasRareTreasure   = (): boolean => !!document.querySelector(`${this.rootSel} .shape.treasure.rare`);
  hasOshax          = (): boolean => !!document.querySelector(`${this.rootSel} .shape.oshax`);

  /** Return a tile node back on the island (e.g., after undo). */
  moveShapeToIsland = (shapeId: string, _price?: number | null): void => {
    const node = document.getElementById(shapeId);
    const pool = document.querySelector(`${this.rootSel} .pool`) || document.querySelector(this.rootSel);
    if (node && pool) pool.appendChild(node);
  };

  /** Family mode helper to show only allowed cats. */
  allowFamilyRescueCat = (): void => {
    // Keep minimal; filtering handled server side and with CSS classes.
  };

  unlockShapeId = (shapeId: string): void => {
    const node = document.getElementById(shapeId);
    node?.classList.remove('locked');
  };

  /** Internal: enable click on a CSS selector of treasure tiles. */
  private _enableTreasureClicks = (selector: string): void => {
    const root = document.querySelector(this.rootSel);
    if (!root) return;
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.classList.add(this.clickableCls);
    });
  };
}
