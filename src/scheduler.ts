class Scheduler {
	/** Default delay in ms */
	private static readonly DEFAULT_TIMEOUT = 50

	private callbackFct: () => void
	private timeout: number
	private timer: number | null = null

	constructor(callbackFct: () => void, timeout: number | null = null) {
		this.callbackFct = callbackFct
		this.timeout = timeout ?? Scheduler.DEFAULT_TIMEOUT
	}

	/** Schedule the callback after the timeout */
	schedule(): void {
		this.unschedule()
		this.timer = window.setTimeout(() => {
			//(window.tiocWrap ?? ((_, fn) => fn()))('Scheduler_setTimeout', () => {
			this.callbackFct()
			//});
		}, this.timeout)
	}

	/** Execute immediately and cancel any previous schedule */
	scheduleNow(): void {
		this.unschedule()
		this.callbackFct()
	}

	/** Cancel any pending timeout */
	unschedule(): void {
		if (this.timer !== null) {
			clearTimeout(this.timer)
			this.timer = null
		}
	}
}
