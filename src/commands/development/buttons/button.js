const { Client, Message, User, Channel, Role, MessageActionRow, MessageButton} = require('discord.js');
const Command = require('../../../utils/structures/BaseCommand');
module.exports = class button extends Command{
    constructor(){
        super({
            name: 'button',
            description: 'Button command: Displays a set of buttons.',
            devOnly:true
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args 
     */
    async run(client, message, args){

        //Multiple rows can be added, up to 5, creating a max of 5x5
        const row = new MessageActionRow();
        for (let i = 0; i < 10; i++) {
            row.addComponents(
                new MessageButton().setCustomId(i.toString()).setLabel(`Button ${i+1}`).setStyle('PRIMARY'),
            );
        }
        
        const sentMessage = await message.channel.send({components:[row]})
        const collector = sentMessage.createMessageComponentCollector({max:1})
        collector.on('collect',(interaction)=>{
            interaction.reply({
                content:`You clicked ${interaction.component.label}`
            })
        })
    }
}

