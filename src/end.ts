const wrapper = {
	constructor: function () {
		this.theisleofcatsduel = new TheIsleOfCatsDuel()
	},

	onGameUserPreferenceChanged: function (prefId, prefValue) {
		this.theisleofcatsduel.onGameUserPreferenceChanged?.(prefId, prefValue)
	},

	setup: function (gamedatas) {
		this.gamedatas = gamedatas
		this.theisleofcatsduel.setup(gamedatas)
	},
	onEnteringState: function (stateName, args) {
		this.theisleofcatsduel.onEnteringState(stateName, args)
	},

	onLeavingState: function (stateName) {
		this.theisleofcatsduel.onLeavingState(stateName)
	},

	onUpdateActionButtons(stateName, args) {
		this.theisleofcatsduel.onUpdateActionButtons(stateName, args)
	},

	setupNotifications() {
		this.theisleofcatsduel.setupNotifications()
	},

	/* This enable to inject translatable styled things to logs or action bar */
	/* @Override */
	format_string_recursive(log: string, args: any) {
		const { log: updatedLog, args: updatedArgs } = this.theisleofcatsduel.bgaFormatText(log, args)
		log = updatedLog
		args = updatedArgs
		return this.inherited(arguments)
	}
}

//define//return declare("bgagame.theisleofcatsduel", ebg.core.gamegui, wrapper);
//define//});
