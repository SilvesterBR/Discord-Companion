const { Client, Interaction } = require('discord.js');
const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class InteractionCreate extends BaseEvent {
	constructor() {
		super('interactionCreate');
	}

	
	/**
	 * @param {Client} client 
	 * @param {Interaction} interaction 
	 */
	async run(client, interaction) {

	}
}