const { Message, MessageEmbed,Interaction, User, Channel, GuildMember, PermissionString, CommandInteraction} = require('discord.js');
const {CommandConstructor} = require('../types/Command')
const Users = require('../data/Users.json')
const {ErrorMessageEmbed} = require('../structures/Embed')
const BaseEvent = require('../structures/BaseEvent');

module.exports = class CommandRequirements extends BaseEvent{
    constructor(event){
        super(event);
    }

    /**
     * Check if a user can execute a given command in a given channel, sending a message if it is not possible
     * @param {CommandConstructor} command - Command to be executed
     * @param {Message | CommandInteraction} origin - The way the command is interacted, through a text message or discor interaction
     * @returns {boolean}
     */
    isAuthorized(command, origin){

        /**@type {User} */
        const user = origin.author ? origin.author : origin.user;
        if(origin.guild.me.permissionsIn(origin.channel).has('SEND_MESSAGES') == false){
            user.send({embeds:[new ErrorMessageEmbed({name:"Permission Error",message:`The server \`\`${origin.guild.name}\`\` has stopped me from sending messages in channel \`\`${origin.channel.name}\`\`.`})]})
            if(origin instanceof Interaction){
                origin.deferReply();
                origin.deleteReply();
            }
            return false;
        }else if(origin.guild.me.permissionsIn(origin.channel).has('EMBED_LINKS') == false){
            this.send(origin, 'Permission Error: Unable to send message embed in the channel, this permission is required.');
            return false;
        }
    
        const missingBotPermissions = this.missing(origin.guild.me, command.info.botPermissions, origin.channel);
        if(missingBotPermissions.length > 0){
            this.send(origin,new ErrorMessageEmbed({name:"Permission Error",message:`\`\`${origin.guild.me.user.username}\`\` lack's the permissions necessary to call this command, the required permissions \`\`${origin.guild.me.user.username}\`\` needs but does not have are:\`\`\`${missingBotPermissions.toString().replace(',',' \n')}\`\`\` `}));
            return false;
        }
        
        //Check if command is enabled
        if(command.info.enabled == false) {
            this.send(origin, new ErrorMessageEmbed({name:"Command Disabled",message:"This command has been disabled and is currently not operational, please check back later."}))
            return false
        }
        //User is a Dev
        if(command.info.devOnly && Users.UserData.some(developer =>developer.discordID != user.id)) {
            //this.send(origin, new ErrorMessageEmbed({name:"Developer Only",message:"This command has been set to developer only, you will not be able to access this command. If you believe you should then change it...?"}));
            return false;
        }
        //User is the owner of the server
        if(command.info.ownerOnly && user.id != origin.guild.ownerId) {
            this.send(origin,  new ErrorMessageEmbed({name:"Owner Only",message:"This command has been set to owner only, only the owner can call this command."}));
            return false;
        }
    
        const missingUserPermissions = this.missing(origin.guild.members.cache.get(user.id), command.info.userPermissions, origin.channel)
        if(missingUserPermissions.length > 0){
            this.send(origin, new ErrorMessageEmbed({name:"Permission Error", message:`***${user.username}*** lack's the permissions necessary to call this command, the required permissions ***${user.username}*** needs but does not have are:\`\`\`${missingUserPermissions.toString().replace(',',' \n')}\`\`\` `}));
            return false;
        }
    
        return true;
    }

    /**
     * 
     * @param {GuildMember} member 
     * @param {PermissionString[]} permissions 
     * @param {Channel} channel
     */
    missing(member, permissions, channel){
        const requiredPermissions = new Array();
        permissions.forEach(perm => {
            if(member.permissionsIn(channel).has(perm) == false){
                requiredPermissions.push(perm);
            }
        })
        return requiredPermissions;
        
    }

    /**
     * 
     * @param {Message | Interaction} origin 
     * @param {MessageEmbed | String} value 
     */
    send(origin, value){
        const content = typeof value === 'string' ? {content:value} : {embeds:[value]}
        if(origin instanceof Interaction){
            content['ephemeral'] == true;
            origin.reply(content)
        }else if(origin instanceof Message){
            origin.channel.send(content).catch((err) =>{
                console.log(err.stack);
            })
        }
    }

}
