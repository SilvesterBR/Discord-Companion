const { Client, Message, User, Channel, Role, CommandInteraction, MessageEmbed, GuildMember} = require('discord.js');
const Command  = require('../../utils/structures/BaseCommand');
const { GenericMessageEmbed } = require('../../utils/structures/Embed');

module.exports = class UserSearch extends Command{
    constructor(){
        super({
            name: 'user',
            args: [
                {name:'user', description:'The user you wish to view', type:'USER', optional: false},
                {name:'isjson',description:'Display the users information in JSON format', type:'BOOLEAN', optional:true}
            ],
            description: 'Obtains information about the selected user.',
            isSlash: true,
            slashOptions:[
                {name:'user', description:'The user you wish to view', type:'USER', optional: false},
                {name:'isjson', description:'Display the users information in JSON format', type:'BOOLEAN', optional:true}
            ],
            contextMenu:{isUser:true}
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args 
     */
    async run(client, message, args){
        console.log(args);
        const isjson = args['isjson'];
        const user = args['user'];

        const guildMember = message.guild.members.cache.get(user.id);
        const data = this.getUser(guildMember, isjson);
        if(typeof data === 'string'){
            message.channel.send(data);
        }else{
            message.channel.send({embeds:[data]});
        }

    }
    /**
     * Method executed when slash command is called
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async interactions(client, interaction){
        const isjson = interaction.options.getBoolean('isjson');
        const user = interaction.options.getUser('user');

        const guildMember = interaction.guild.members.cache.get(user.id);
        const data = this.getUser(guildMember, isjson);
        if(typeof data === 'string'){
            interaction.reply({content: data});
        }else{
            interaction.reply({embeds:[data]});      
        }
    }
    /**
     * Method executed when user command is called
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @param {User} user
     */
    async user(client, interaction, user){
        const guildMember = interaction.guild.members.cache.get(user.id);
        interaction.reply({embeds:[this.getUser(guildMember)]});      
    }

    /**
     * Obtain the specific user
     * @param {GuildMember} user 
     * @param {boolean} isjson
     * @returns {String | MessageEmbed}
     */
    getUser(user, isjson){
        if(isjson == true){
            return `\`\`\`${JSON.stringify(user.user, null, 2)}\`\`\``;
        }else{
            const roles = user.roles.cache.map(role => `<@&${role.id}>`);roles.pop()
            const userEmbed = new GenericMessageEmbed()
            userEmbed.setTitle(`${user.user.tag}`);
            userEmbed.addField('ID', user.user.id);
            userEmbed.addField('Bot', user.user.bot ? 'Yes' : 'No', true);
            userEmbed.addField('Nickname', user.nickname != null ? user.nickname : 'None', true);
            userEmbed.addField('Roles', roles.length > 0 ? roles.toString().replace(',',' ') : 'None');
            userEmbed.addField('Joined Server', new Date(user.guild.createdTimestamp).toDateString(), true);
            userEmbed.addField('Joined Discord', new Date(user.user.createdTimestamp).toDateString(), true);
            userEmbed.setThumbnail(user.user.avatarURL());
            return userEmbed;
        }
    }
}