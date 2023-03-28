const { Client, Interaction } = require('discord.js');
const { ErrorMessageEmbed } = require('../../utils/structures/Embed');
const CommandRequirements = require('../../utils/setup/CommandRequirements');

module.exports = class RegisterInteraction extends CommandRequirements {
	constructor() {
		super('interactionCreate');
	}

	
	/**
	 * @param {Client} client 
	 * @param {Interaction} interaction 
	 */
	async run(client, interaction) {
		if(interaction.isCommand() || interaction.isContextMenu()){
			const command = client.commands.get(interaction.commandName);
			if(this.isAuthorized(command, interaction) == true){
				if(interaction.isCommand()){
					command.interactions(client, interaction).catch((err)=>{
						//Clean the tsack trace and remove any frames that are in the node_modules.
						//Note: Errors that occur with packages will not show
						console.log((err.stack).replace(/^.*[\\/]node_modules[\\/].*$/gm, '').replace(/\n+/g, '\n'))
						interaction.reply({
							embeds:[new ErrorMessageEmbed({name:"Unexpected Error", message:"An unexpected error has occured."})]
						});
					});
				}else if(interaction.isUserContextMenu()){
					command.user(client, interaction, interaction.options.getUser('user')).catch((err)=>{
						//Clean the tsack trace and remove any frames that are in the node_modules.
						//Note: Errors that occur with packages will not show
						console.log((err.stack).replace(/^.*[\\/]node_modules[\\/].*$/gm, '').replace(/\n+/g, '\n'))
						interaction.reply({
							embeds:[new ErrorMessageEmbed({name:"Unexpected Error", message:"An unexpected error has occured."})]
						});
					});
				}else if(interaction.isMessageContextMenu()){
					command.message(client, interaction, interaction.options.getMessage('message')).catch((err)=>{
						//Clean the tsack trace and remove any frames that are in the node_modules.
						//Note: Errors that occur with packages will not show
						console.log((err.stack).replace(/^.*[\\/]node_modules[\\/].*$/gm, '').replace(/\n+/g, '\n'))
						interaction.reply({
							embeds:[new ErrorMessageEmbed({name:"Unexpected Error", message:"An unexpected error has occured."})]
						});
					});
				}
			}
		}
	}
}