/**
 * Command manager (TypeScript port of Dojo declare version)
 * - Keeps undo/redo stacks of action groups
 * - Drives page title changes during multi-step commands
 */
type ContinueFct = (value?: any) => void;
type ErrorFct = () => void;

type Action = {
  /** Called during endCommand() sequencing */
  doFunction: (onContinue: ContinueFct, onError: ErrorFct) => void;
  /** Optional redo/undo mirroring doFunction’s side-effects */
  redoFunction?: (value?: any) => void;
  undoFunction?: (value?: any) => void;
  /** Value produced by doFunction and reused by redo/undo */
  doValue?: any;
};

type ActionGroup = {
  actions: Action[];
  stateValue: any;
  description: string | null;
  descriptionArgs: Record<string, any> | null;
};
 class CommandMgr {
  /** Game instance */
  private game: TheIsleOfCatsDuelGame;

  /** Undo/redo stacks */
  private undoGroups: ActionGroup[] = [];
  private redoGroups: ActionGroup[] = [];

  /** Currently executing group and position */
  private currentGroup: ActionGroup | null = null;
  private currentGroupDoIndex: number | null = null;

  /** UI state */
  private hideButtons = true;
  private isButtonDisabled = false;

  /** Subscribers to state changes */
  private observers: Record<string, (mgr: CommandMgr) => void> = {};

  /** Action log dedup */
  private lastSentActionLog: string;

  /** ctor */
  constructor(game: TheIsleOfCatsDuelGame) {
    this.game = game;
    this.lastSentActionLog = this._actionLogToSend();
  }

  /** Lifecycle placeholders to mirror original API */
  setup = (_gamedatas: any) => {};
  onEnteringState = (_stateName: string, _args: any) => {
    this.hideButtons = true;
    this.updateButtonVisibility();
  };
  onLeavingState = (_stateName: string) => {
    this.hideButtons = true;
    this.updateButtonVisibility();
  };
  onUpdateActionButtons = (_stateName: string, _args: any) => {
    this.game.gameui.addActionButton('button_undo', _('Undo'), () => this.undo());
    this.game.gameui.addActionButton('button_redo', _('Redo'), () => this.redo());
    this.updateButtonVisibility();
  };

  /** Show/Hide/Enable/Disable buttons */
  showButtons = () => {
    this.hideButtons = false;
    this.updateButtonVisibility();
    this._notifyObservers();
  };
  disableButtons = () => { this.isButtonDisabled = true; };
  enableButtons = () => { this.isButtonDisabled = false; };

  /** Update Undo/Redo buttons according to stacks and current command */
  updateButtonVisibility = () => {
    const undoBtn = document.getElementById('button_undo');
    const redoBtn = document.getElementById('button_redo');

    if (undoBtn) {
      if (this.hideButtons) {
        undoBtn.classList.add('tioc-hidden');
      } else {
        undoBtn.classList.remove('tioc-hidden');
        undoBtn.classList.add('disabled');
        if (this.undoGroups.length !== 0 || this.isInCommand()) {
          undoBtn.classList.remove('tioc-hidden');
          undoBtn.classList.remove('disabled');
        }
        if (this.isButtonDisabled) undoBtn.classList.add('disabled');
      }
    }

    if (redoBtn) {
      if (this.hideButtons) {
        redoBtn.classList.add('tioc-hidden');
      } else {
        redoBtn.classList.remove('tioc-hidden');
        redoBtn.classList.add('disabled');
        if (this.redoGroups.length !== 0 && !this.isInCommand()) {
          redoBtn.classList.remove('tioc-hidden');
          redoBtn.classList.remove('disabled');
        }
        if (this.isButtonDisabled) redoBtn.classList.add('disabled');
      }
    }
  };

  /** Observer registry */
  registerObserver = (key: string, onChanged: (mgr: CommandMgr) => void) => {
    this.observers[key] = onChanged;
    onChanged(this);
  };
  unregisterObserver = (key: string) => { delete this.observers[key]; };

  /** Notify subscribers + push lightweight state log */
  private _notifyObservers = () => {
    this._sendActionLog();
    for (const key in this.observers) this.observers[key](this);
  };

  /** State checks */
  isInCommand = () => this.currentGroup !== null;
  hasCommandGroups = () => this.undoGroups.length > 0;
  commandGroupsStateValues = () => this.undoGroups.map(g => g.stateValue);
  currentCommandStateValue = () => this.currentGroup?.stateValue ?? null;

  /** Clear all command history */
  clearCommandGroup = () => {
    this.undoGroups = [];
    this.redoGroups = [];
    this.currentGroup = null;
    this.currentGroupDoIndex = null;
    this.updateButtonVisibility();
    this._notifyObservers();
  };
  commandGroupCommitedToServer = () => { this.clearCommandGroup(); };

  /** Undo / Redo handlers */
  undo = () => {
    if (this.isInCommand()) {
      this._undoCurrentGroup((this.currentGroupDoIndex ?? 0) - 1);
      this.updateButtonVisibility();
      this._notifyObservers();
    } else if (this.undoGroups.length > 0) {
      const group = this.undoGroups.pop()!;
      this._undoGroup(group);
      this.redoGroups.push(group);
      this.updateButtonVisibility();
      this._notifyObservers();
    }
  };
  redo = () => {
    if (this.redoGroups.length === 0 || this.isInCommand()) return;
    const group = this.redoGroups.pop()!;
    this._redoGroup(group);
    this.undoGroups.push(group);
    this.updateButtonVisibility();
    this._notifyObservers();
  };

  /** Begin a multi-step command */
  startCommand = (initialStateValue: any = null) => {
    this.currentGroup = {
      actions: [],
      stateValue: initialStateValue,
      description: null,
      descriptionArgs: null,
    };
    this.updateButtonVisibility();
    this._notifyObservers();
  };

  /** Change/restore page title while in a command */
  changeTitle = (newTitle: string, newArgs: Record<string, any> | null = null) => {
    if (!this.currentGroup) return;
    if (this.currentGroup.description === null) {
      this.currentGroup.description = this.game.gamedatas.gamestate.descriptionmyturn;
      this.currentGroup.descriptionArgs = { ...(this.game.gamedatas.gamestate.args ?? {}) };
    }
    this.game.gamedatas.gamestate.descriptionmyturn = newTitle;
    if (this.game.gamedatas.gamestate.args === null) {
      this.game.gamedatas.gamestate.args = { ...(newArgs ?? {}) };
    } else if (newArgs) {
      Object.assign(this.game.gamedatas.gamestate.args, newArgs);
    }
    this.game.gameui.updatePageTitle();
  };
  resetTitle = () => {
    if (!this.currentGroup || this.currentGroup.description === null) return;
    this.game.gamedatas.gamestate.descriptionmyturn = this.currentGroup.description;
    this.game.gamedatas.gamestate.args = this.currentGroup.descriptionArgs;
    this.game.gameui.updatePageTitle();
  };

  /** Add action steps */
  addValidation = (message: string, f: () => boolean) => {
    this.currentGroup!.actions.push({
      doFunction: (ok, ko) => {
        if (f()) ok();
        else { this.game.gameui.showMessage(message, 'error'); ko(); }
      },
    });
  };
  addSimple = (doF: () => void, undoF: () => void) => {
    this.currentGroup!.actions.push({
      doFunction: (ok) => { doF(); ok(); },
      redoFunction: doF,
      undoFunction: undoF,
    });
  };
  addSimple3 = (doF: () => void, redoF: (v?: any) => void, undoF: (v?: any) => void) => {
    this.currentGroup!.actions.push({
      doFunction: (ok) => { doF(); ok(); },
      redoFunction: redoF,
      undoFunction: undoF,
    });
  };
  add = (
    doF: (ok: ContinueFct, ko: ErrorFct) => void,
    redoF: (v?: any) => void,
    undoF: (v?: any) => void
  ) => {
    this.currentGroup!.actions.push({ doFunction: doF, redoFunction: redoF, undoFunction: undoF });
  };

  /** Finish the command: run all doFunctions in sequence */
  endCommand = () => { this._endActionGroup(0); };

  /** Internal: execute doFunctions one by one */
  private _endActionGroup = (i: number) => {
    if (!this.currentGroup) return;
    if (i >= this.currentGroup.actions.length) {
      this.undoGroups.push(this.currentGroup);
      this.redoGroups = [];
      this.resetTitle();
      this.currentGroup = null;
      this.currentGroupDoIndex = null;
      this.updateButtonVisibility();
      this._notifyObservers();
      return;
    }
    this.currentGroupDoIndex = i;
    const action = this.currentGroup.actions[i];
    action.doFunction(
      (value) => { action.doValue = value; this._endActionGroup(i + 1); },
      () => this._undoCurrentGroup(i - 1),
    );
  };

  /** Internal: redo an entire group */
  private _redoGroup = (group: ActionGroup) => {
    for (let i = 0; i < group.actions.length; i++) {
      const a = group.actions[i];
      if (a.redoFunction) a.redoFunction(a.doValue);
    }
  };

  /** Internal: undo an entire group from an optional start index */
  private _undoGroup = (group: ActionGroup, startIndex: number | null = null) => {
    for (let i = (startIndex ?? group.actions.length - 1); i >= 0; i--) {
      const a = group.actions[i];
      if (a.undoFunction) a.undoFunction(a.doValue);
    }
  };

  /** Internal: undo the currently-executing group and reset */
  private _undoCurrentGroup = (i: number) => {
    if (!this.currentGroup) return;
    this._undoGroup(this.currentGroup, i);
    this.resetTitle();
    this.currentGroup = null;
    this.currentGroupDoIndex = null;
    this.updateButtonVisibility();
    this._notifyObservers();
  };

  /** Lightweight state snapshot used for action log */
  private _actionLogToSend = () =>
    JSON.stringify({
      undoStateValue: this.commandGroupsStateValues(),
      currentStateValue: this.currentCommandStateValue(),
    });

  /** Debounced action log to window hook (if present) */
  private _sendActionLog = () => {
    const payload = this._actionLogToSend();
    if (this.lastSentActionLog === payload) return;
    this.lastSentActionLog = payload;
    //window.tiocAddActionLog?.('cmd', payload);
  };
}
