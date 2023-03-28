const { Client, CommandInteraction, Message, User, Channel, Role} = require('discord.js');
const BaseCommand = require('../structures/BaseCommand');
module.exports = class  extends BaseCommand{
    constructor(){
        super({
            enabled: false,
            name: '',
            args: [],
            description: '',
            isSlash: true
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client
     * @param {Message} message
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args
     */
    async run(client, message, args){


    }
    /**
     * Method executed when slash command is called
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async interactions(client, interaction){

    }
}