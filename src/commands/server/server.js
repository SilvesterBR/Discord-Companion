const { Client, Message, User, Channel, Role, CommandInteraction, Guild} = require('discord.js');
const Command  = require('../../utils/structures/BaseCommand');
const { GenericMessageEmbed } = require('../../utils/structures/Embed');


/**
 * Completed: True
 * CanImprove: True
 */
module.exports = class Server extends Command{
    constructor(){
        super({
            name: 'server',
            description: 'Obtains information about the server.',
            isSlash: true,
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args 
     */
    async run(client, message, args){
        const server = this.getServer(message.guild);
        message.channel.send({embeds:[server]});
    }
    /**
     * Method executed when slash command is called
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async interactions(client, interaction){
        const server = this.getServer(interaction.guild);
        interaction.reply({embeds:[server]});
    }

    /**
     * Obtain information about a given server
     * @param {Guild} guild 
     */
    getServer(guild){
        const guildEmbed = new GenericMessageEmbed()
            .setTitle(`${guild.name}`)
            .addField('Members',`${guild.memberCount}`,true)
            .addField('Roles',`${guild.roles.cache.size}`,true)
            .addField('Channels',`${guild.channels.cache.filter(channel => channel.type != 'GUILD_CATEGORY').size}`,true)
            .addField('Created',`${new Date(guild.joinedTimestamp).toDateString()}`)
            .addField('Owner',`<@${guild.ownerId}>`);
        return guildEmbed
    }
}