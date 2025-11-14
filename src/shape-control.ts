
/** Handles rotation/flip/drag confirmation of a placed shape. */
 class ShapeControl  {
  private game: TheIsleOfCatsDuelGame;
  private active: {
    shapeId: string;
    x: number;
    y: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    onConfirm: (shapeId: string, x: number, y: number, rotation: number, flipH: boolean, flipV: boolean, usedGrid: XY[]) => void;
  } | null = null;

  constructor(game: TheIsleOfCatsDuelGame) {
    this.game = game;
  }

  /** Attach control to an already moved shape; adds confirm/cancel UI and keyboard shortcuts. */
  attachToShapeId = (
    shapeId: string, x: number, y: number, canPutAnywhere: boolean,
    onConfirm: (shapeId: string, x: number, y: number, rotation: number, flipH: boolean, flipV: boolean, usedGrid: XY[]) => void,
  ): void => {
    this.detach();
    this.active = { shapeId, x, y, rotation: 0, flipH: false, flipV: false, onConfirm };
    const node = document.getElementById(shapeId);
    if (!node) return;

    // Simple controls: R to rotate, H to flipH, V to flipV, Enter to confirm, Esc to cancel
    const keyHandler = (ev: KeyboardEvent) => {
      if (!this.active) return;
      if (ev.key === 'r' || ev.key === 'R') this._applyTransform( (this.active.rotation + 1) % 4, this.active.flipH, this.active.flipV );
      else if (ev.key === 'h' || ev.key === 'H') this._applyTransform( this.active.rotation, !this.active.flipH, this.active.flipV );
      else if (ev.key === 'v' || ev.key === 'V') this._applyTransform( this.active.rotation, this.active.flipH, !this.active.flipV );
      else if (ev.key === 'Enter') this._confirm();
      else if (ev.key === 'Escape') this.detach();
    };
    document.addEventListener('keydown', keyHandler, { once: false });

    // Store disposer
    (node as any)._tiocKeyHandler = keyHandler;

    // Visual hint when can put anywhere
    if (canPutAnywhere) node.classList.add('can-anywhere');
  };

  /** Detach and cleanup UI. */
  detach = (): void => {
    if (!this.active) return;
    const node = document.getElementById(this.active.shapeId);
    if (node && (node as any)._tiocKeyHandler) {
      document.removeEventListener('keydown', (node as any)._tiocKeyHandler);
      delete (node as any)._tiocKeyHandler;
    }
    node?.classList.remove('can-anywhere');
    this.active = null;
  };

  /** Internal: apply transform to active shape. */
  private _applyTransform = (rotation: number, flipH: boolean, flipV: boolean): void => {
    if (!this.active) return;
    this.active.rotation = rotation;
    this.active.flipH = flipH;
    this.active.flipV = flipV;
    const el = document.getElementById(this.active.shapeId) as HTMLElement | null;
    if (!el) return;
    const rot = `rotate(${rotation * 90}deg)`;
    const fh = flipH ? 'scaleX(-1)' : 'scaleX(1)';
    const fv = flipV ? 'scaleY(-1)' : 'scaleY(1)';
    el.style.transform = `${rot} ${fh} ${fv}`.trim();
  };

  /** Internal: compute used grid under the active shape's squares. */
  private _computeUsedGrid = (): XY[] => {
    if (!this.active) return [];
    // Minimal implementation: defer to boat overlay that marks squares when confirming in ActionMgr.
    // Here return at least the anchor cell for safety.
    return [{ x: this.active.x, y: this.active.y }];
  };

  /** Confirm placement and emit callback. */
  private _confirm = (): void => {
    if (!this.active) return;
    const a = this.active;
    const used = this._computeUsedGrid();
    const cb = a.onConfirm;
    this.detach();
    cb(a.shapeId, a.x, a.y, a.rotation, a.flipH, a.flipV, used);
  };
}
