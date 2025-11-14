
 class TitleMgr {
  private el: HTMLElement | null;

  constructor(selector = '#tioc-title') {
    this.el = document.querySelector<HTMLElement>(selector);
  }

  /** Replace the title text. */
  set = (title: string): void => {
    if (!this.el) return;
    this.el.textContent = title;
  };

  /** Clear the title. */
  clear = (): void => {
    if (!this.el) return;
    this.el.textContent = '';
  };
}
