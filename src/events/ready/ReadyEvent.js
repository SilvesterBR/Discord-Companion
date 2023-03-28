const BaseEvent = require('../../utils/structures/BaseEvent');
const discord = require('discord.js');
const { registerCommands,clearSlashCommands } = require('../../utils/setup/Register');

module.exports = class ReadyEvent extends BaseEvent {
	constructor() {
		super('ready');
	}

	/**
	 * 
	 * @param {discord.Client} client 
	 */
	async run (client) {
		console.log(client.user.tag + ' has logged in.');
		await registerCommands(client, '../../commands')
		// clearSlashCommands(client, '../commands')

	}
}