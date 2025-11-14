

/**
 * Provide a sandbox to try polyomino shapes visually before committing.
 */
 class TryShapesMgr {
  private root: HTMLElement | null;
  private game: TheIsleOfCatsDuelGame;

  constructor(game: TheIsleOfCatsDuelGame, rootSel = '#tioc-try') {
    this.game = game;
    this.root = document.querySelector<HTMLElement>(rootSel);
  }

  /** Show a list of shapes (by ids) as clickable previews. */
  show = (shapeIds: string[], onPick: (shapeId: string) => void): void => {
    const r = this.root;
    if (!r) return;
    r.innerHTML = '';
    shapeIds.forEach((id) => {
      const orig = document.getElementById(id);
      if (!orig) return;
      const clone = orig.cloneNode(true) as HTMLElement;
      clone.id = `${id}-try`;
      clone.classList.add('tioc-clickable');
      r.appendChild(clone);
      this.game.addOnClick(clone, (ev) => {
        ev.preventDefault();
        onPick(id);
      });
    });
  };

  /** Hide previews. */
  hide = (): void => {
    if (this.root) this.root.innerHTML = '';
  };
}
