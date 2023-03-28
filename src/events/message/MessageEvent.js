const {Client, Message} = require('discord.js');
const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class MessageEvent extends BaseEvent {
	constructor() {
		super('messageCreate');
	}

	/**
	 * @param {Client} client 
	 * @param {Message} message 
	 */
	async run(client, message) {
	}
}