const { Client, CommandInteraction, Message, MessageEmbed} = require('discord.js');
const Command = require('../../utils/structures/BaseCommand');
const { SearchPage } = require('../../utils/components/Page/Page');

module.exports = class test extends Command{
    constructor(){
        super({
            name: 'test',
            args: [{name:'test', description:'test', type:'USER', optional: false, isArray:true}],
            description: 'This is a test command',
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {CommandTypes.Arguments} args 
     */
    async run(client, message, args){
        const all = []
        for (let index = 0; index < 40; index++) {
            all.push(new MessageEmbed().setTitle('Tim' + index.toString()))
        }

        const page = new SearchPage(message, {embeds: all, results: all.map(elem => {return elem.title + "123"}), client: client, isSelectable: true, isCallback: true})
        
        page.create((interaction, value, embed)=>{
            page.next()
        });
    }
    /**
     * Method executed when slash command is called
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async interactions(client, interaction){
        interaction.reply({
            content: 'Hello'
        })
    }
}