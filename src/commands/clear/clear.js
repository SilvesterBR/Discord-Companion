const Command  = require('../../utils/structures/BaseCommand');
const CommandTypes = require('../../utils/types/Command');
const { Client, Message, CommandInteraction, TextChannel} = require('discord.js');

module.exports = class Server extends Command{
    constructor(){
        super({
            name: 'clear',
            args:[{
                name:'amount', 
                description:'The total amount of messages to delete', 
                type:'NUMBER', 
                min:1
            }],
            description: 'Delete messages in channel that are less than 14 days old, this is due to an API limitation. ',
            isSlash:true,
            slashOptions:[{
                name:'amount', 
                description:'The total amount of messages to delete', 
                type:'NUMBER',
                minValue:1
            }],
            botPermissions:['MANAGE_MESSAGES'],
            userPermissions:['MANAGE_MESSAGES']
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {CommandTypes.Argument} args 
     */
    async run(client, message, args){
        await message.delete();
        this.clearChannel(message.channel, args['amount'])
    }
    /**
     * Method executed when slash command is called
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async interactions(client, interaction){

        const amount = interaction.options.getNumber('amount');
        await this.clearChannel(interaction.channel, amount).then(()=>{
            interaction.reply({ephemeral: true, content:'Success, messages may take a few seconds to disappear'})
        })
    }

    /**
     * Obtain information about a given server
     * @param {TextChannel} channel 
     * @param {Number} amount
     */
    async clearChannel(channel, amount){
        const max = 100; //The max amount of messages we can delete in a single call

        const chunks = amount / max;
        const chunkTotal = Math.floor(chunks); //Total chunks, excluding remainders

        const remainder = chunks % 1
        const extra = Math.floor(remainder * max); //Total items that do not fit into a single full chunk

        for (let i = 0; i < chunkTotal; i++) {
            await channel.bulkDelete(100, true).catch(() =>{});
        }
        if(extra > 0){
            await channel.bulkDelete(amount != undefined ? extra : 1, true).catch(() =>{});
        }
    }
}