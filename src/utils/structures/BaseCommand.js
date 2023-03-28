const CommandTypes = require('../types/Command')
const { Client, Message, Interaction, MessageEmbed } = require("discord.js")
const {ErrorMessageEmbed, GenericMessageEmbed} = require('./Embed')

const DEFAULT_COMMAND = {
    enabled: true,
    name: null,
    aliases: new Array(),
    args: new Array(),
    description: '',
    category: null,
    botPermissions: ['SEND_MESSAGES','EMBED_LINKS'],
    userPermissions: new Array(),
    ownerOnly: false,
    devOnly: false,
    isSlash: false,
    slashOptions: new Array(),
    contextMenu: {
        isUser:false, 
        isMessage:false
    }
}


module.exports = class Command{
    /**
     * 
     * @param {CommandTypes.CommandConstructor} options
     */
    constructor({
        enabled = true,
        name = null,
        aliases = new Array(),
        args = new Array(),
        description = '',
        category = null,
        botPermissions = ['SEND_MESSAGES','EMBED_LINKS'],
        userPermissions = new Array(),
        ownerOnly = false,
        devOnly = false,
        isSlash = false,
        slashOptions = new Array(),
        contextMenu = {
            isUser:false, 
            isMessage:false
        }
    }){

        this.info = {enabled, name, aliases, args, description, category, userPermissions, botPermissions, ownerOnly, devOnly, isSlash, slashOptions, contextMenu}
    }

    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args
     */
    async run(client, message, args){
        message.channel.send({
            embeds:[new ErrorMessageEmbed({name:"Undefined Command", message:"This command has no prefix declaration and cannot be run via a prefix command, this may only be called through a slash command."})]
        })
    }
    /**
     * Method executed when slash command is called
     * @param {Client} client 
     * @param {Interaction} interaction 
     * @readonly
     */
    async interactions(client, interaction){
        interaction.reply({
            embeds:[new ErrorMessageEmbed({name:"Undefined Command", message:"This command has no slash command declaration."})]
        })
    }
    async user(client, interaction, user){
        interaction.reply({
            embeds:[new ErrorMessageEmbed({name:"Undefined Command", message:"This command has no user command declaration."})]
        })
    }
    async message(client, interaction, message){
        interaction.reply({
            embeds:[new ErrorMessageEmbed({name:"Undefined Command", message:"This command has no message command declaration."})]
        })
    }
    
    /**
     * Function for handling slash commands
     * @param {Client} client 
     * @param {Message} message 
     */
     async help(client, message){
        message.channel.send({embeds:[this.toMessageEmbed()]})
    }

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Error} error 
     */
    async error(client, message, error){
        const help = this.toMessageEmbed()
        message.channel.send({
            embeds:[new ErrorMessageEmbed({name:error.name, message:error.message}).addFields(help.fields)]
        })
    }

    /**
     * Convert the command to a readable message embed, including most of its details
     * @returns {MessageEmbed}
     */
    toMessageEmbed(){
        const commandEmbed = new GenericMessageEmbed();
        commandEmbed.setTitle(`Command: ${this.info.name}`);
        commandEmbed.setDescription(this.info.description);
        const alises = `\n ***Alises:*** ${this.info.aliases.toString().replace(',', ', ')}`
        commandEmbed.setDescription(commandEmbed.description + (this.info.aliases.length > 0 ? alises : ""));

        this.info.args.forEach((arg,i)=>{
            var information = "";
            information+=`***Description:*** ${arg.description}\n`;
            information+=`***Type:*** ${arg.type}\n`;
            if(arg.type == 'NUMBER'){
                if(arg.min != undefined){
                    information+=`***Minimum Value:*** ${arg.min}\n`;
                }
                if(arg.max != undefined){
                    information+=`***Maximum Value:*** ${arg.max}\n`;
                }
            }
            information+=`***Optional:*** ${arg.optional === false ? 'No' : 'Yes'}\n`;
            information+=`***IsArray:*** ${arg.optional === true ? 'No' : 'Yes'}`;

            commandEmbed.addField(`Argument(${i+1}): ${arg.name}`, information, true);
        })
        return commandEmbed;
    }
}